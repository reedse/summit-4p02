# TheNewsAPI Integration for Article Discovery

## Feature Overview
This feature enhances the Favourites page by allowing users to discover, favorite, and summarize news articles based on selected categories of interest.

See https://www.thenewsapi.com/documentation for documentation.

## Key Functionality
1. **Category Selection**: Users can select up to 2 categories of interest
2. **Article Discovery**: System fetches relevant articles from TheNewsAPI
3. **Article Management**: Users can favorite/unfavorite articles for later access
4. **Summarization**: Users can send articles to the AI Summary tool for content summarization

## User Experience Flow
1. User navigates to Favourites page
2. User selects up to 2 categories from a dropdown 
3. User clicks "Search Articles" to fetch relevant news
4. System displays article cards with images, titles, descriptions
5. User can:
   - Favorite/unfavorite articles (star icon)
   - Click "Summarize" to send article to AI Summary tool
   - Click "Read More" to open article in new tab

## Technical Implementation

### Database Schema Extensions
```python
# New models to store articles and user favorites
class Article(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    uuid = db.Column(db.String(100), unique=True)  # TheNewsAPI unique identifier
    title = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text)
    keywords = db.Column(db.String(500))
    snippet = db.Column(db.Text)
    url = db.Column(db.String(500), nullable=False)
    image_url = db.Column(db.String(500))
    language = db.Column(db.String(10))
    source = db.Column(db.String(100))
    categories = db.Column(db.String(200))  # Comma-separated list of categories
    locale = db.Column(db.String(10))
    published_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
       
class FavoriteArticle(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    article_id = db.Column(db.Integer, db.ForeignKey("article.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    # Prevent duplicate favorites
    __table_args__ = (db.UniqueConstraint('user_id', 'article_id', name='unique_user_article'),)
```

### Backend API Endpoints

#### 1. Search Articles
```python
@views.route('/api/news/search', methods=['POST'])
@login_required
def search_news():
    data = request.get_json()
    categories = data.get('categories', [])
    
    if not categories or len(categories) > 2:
        return jsonify({'error': 'Please provide 1-2 categories'}), 400
        
    # Call TheNewsAPI
    articles = fetch_from_news_api(categories)
    
    return jsonify({'articles': articles})
```

#### 2. Toggle Article Favorite
```python
@views.route('/api/news/favorite', methods=['POST'])
@login_required
def toggle_article_favorite():
    data = request.get_json()
    article_data = data.get('article')
    
    # Check if article exists in DB, if not create it
    article = Article.query.filter_by(uuid=article_data['uuid']).first()
    if not article:
        article = Article(
            uuid=article_data['uuid'],
            title=article_data['title'],
            description=article_data.get('description', ''),
            keywords=article_data.get('keywords', ''),
            snippet=article_data.get('snippet', ''),
            url=article_data['url'],
            image_url=article_data.get('image_url', ''),
            language=article_data.get('language', ''),
            source=article_data.get('source', ''),
            categories=','.join(article_data.get('categories', [])),
            locale=article_data.get('locale', ''),
            published_at=datetime.fromisoformat(article_data.get('published_at', '').replace('Z', '+00:00'))
            if article_data.get('published_at') else datetime.utcnow()
        )
        db.session.add(article)
        db.session.commit()
    
    # Toggle favorite status
    favorite = FavoriteArticle.query.filter_by(user_id=current_user.id, article_id=article.id).first()
    
    if favorite:
        db.session.delete(favorite)
        is_favorite = False
    else:
        favorite = FavoriteArticle(user_id=current_user.id, article_id=article.id)
        db.session.add(favorite)
        is_favorite = True
        
    db.session.commit()
    
    return jsonify({'success': True, 'is_favorite': is_favorite})
```

#### 3. Get Favorite Articles
```python
@views.route('/api/news/favorites', methods=['GET'])
@login_required
def get_favorite_articles():
    favorites = db.session.query(Article).join(FavoriteArticle).filter(
        FavoriteArticle.user_id == current_user.id
    ).all()
    
    articles = [{
        'id': article.id,
        'uuid': article.uuid,
        'title': article.title,
        'description': article.description,
        'keywords': article.keywords,
        'snippet': article.snippet,
        'url': article.url,
        'image_url': article.image_url,
        'language': article.language,
        'source': article.source,
        'categories': article.categories.split(',') if article.categories else [],
        'locale': article.locale,
        'published_at': article.published_at.isoformat() if article.published_at else None,
        'is_favorite': True
    } for article in favorites]
    
    return jsonify({'favorites': articles})
```

#### 4. TheNewsAPI Integration
```python
def fetch_from_news_api(categories):
    api_key = os.environ.get('THE_NEWS_API_KEY')
    articles = []
    
    # Convert our categories to TheNewsAPI categories
    category_str = ','.join(categories)
    
    # Use the Headlines endpoint for top news by category
    url = f"https://api.thenewsapi.com/v1/news/top?api_token={api_key}&categories={category_str}&language=en&limit=10"
    
    try:
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()
            
            # Check if articles were returned
            if 'data' in data:
                for article in data['data']:
                    # Add is_favorite flag for UI (will be updated on client side)
                    article['is_favorite'] = False
                    articles.append(article)
    except Exception as e:
        print(f"Error fetching from TheNewsAPI: {e}")
    
    return articles
```

### Frontend Implementation (Favourites.jsx)

#### 1. New State Variables
```jsx
const [categories, setCategories] = useState([]);
const [availableCategories] = useState([
  'business', 'entertainment', 'general', 'health', 
  'science', 'sports', 'technology'
]);
const [articles, setArticles] = useState([]);
const [searchLoading, setSearchLoading] = useState(false);
```

#### 2. Category Selection Handler
```jsx
const handleCategoryChange = (event) => {
  const value = event.target.value;
  setCategories(value.slice(0, 2)); // Limit to 2 categories
};
```

#### 3. Article Search Function
```jsx
const searchArticles = async () => {
  if (categories.length === 0) {
    setNotification({
      open: true,
      message: 'Please select at least one category',
      severity: 'error',
    });
    return;
  }
  
  setSearchLoading(true);
  
  try {
    const response = await axios.post('/api/news/search', {
      categories: categories,
    });
    
    // Update favorite status for any articles already in favorites
    const updatedArticles = response.data.articles.map(article => {
      const isFavorite = favourites.some(fav => fav.uuid === article.uuid);
      return { ...article, is_favorite: isFavorite };
    });
    
    setArticles(updatedArticles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    setNotification({
      open: true,
      message: 'Failed to fetch articles',
      severity: 'error',
    });
  } finally {
    setSearchLoading(false);
  }
};
```

#### 4. Article Favorite Toggle
```jsx
const handleFavoriteArticle = async (article) => {
  try {
    const response = await axios.post('/api/news/favorite', {
      article: article,
    });
    
    if (response.data.success) {
      // Update the article in state with its new favorite status
      setArticles(articles.map(a => 
        a.uuid === article.uuid ? {...a, is_favorite: response.data.is_favorite} : a
      ));
      
      // If the article was favorited, add it to favorites, otherwise remove it
      if (response.data.is_favorite) {
        setFavourites([...favourites, {...article, is_favorite: true}]);
      } else {
        setFavourites(favourites.filter(fav => fav.uuid !== article.uuid));
      }
      
      setNotification({
        open: true,
        message: response.data.is_favorite ? 'Added to favorites' : 'Removed from favorites',
        severity: 'success',
      });
    }
  } catch (error) {
    console.error('Error toggling favorite:', error);
    setNotification({
      open: true,
      message: 'Failed to update favorite status',
      severity: 'error',
    });
  }
};
```

#### 5. Article Summarization
```jsx
const summarizeArticle = (article) => {
  // Store the article URL in localStorage to be used by AISummary
  localStorage.setItem('articleToSummarize', article.url);
  // Navigate to AISummary page
  window.location.href = '/ai-summary';
};
```

### AISummary.jsx Update
```jsx
// Add to AISummary component useEffect
useEffect(() => {
  // Check if there's an article URL to summarize
  const articleUrl = localStorage.getItem('articleToSummarize');
  if (articleUrl) {
    setUrl(articleUrl);
    setInputTab(1); // Switch to URL tab
    localStorage.removeItem('articleToSummarize'); // Clear after use
  }
}, []);
```

## Design and UI Components

### Article Card Design
- Each article displayed as a card with:
  - Featured image (if available)
  - Title
  - Brief description or snippet
  - Source and publication date
  - Action buttons (favorite, summarize, read more)

### Category Selection UI
- Multiple select dropdown with available categories
- Helper text indicating 2 category maximum
- Search button with loading indicator

## Integration Requirements
- TheNewsAPI key needs to be added to environment variables as THE_NEWS_API_KEY
- Database migrations for new Article and FavoriteArticle models
- Updates to user profile to include article favorites

## User Restrictions
- Free users: Standard functionality
- Pro users: Additional filtering options (future enhancement)
