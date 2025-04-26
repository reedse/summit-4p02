import React from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardActions, 
  CardMedia, 
  Typography, 
  Button, 
  IconButton, 
  Chip,
  Tooltip,
  Skeleton,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { 
  StarOutlined as StarIcon, 
  StarBorderOutlined as StarBorderIcon,
  SummarizeOutlined as SummarizeIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';

const ArticleCard = ({ article, onToggleFavorite, onSummarize, loading = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  if (loading) {
    return (
      <Fade in={true} timeout={800}>
        <Card 
          elevation={3}
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            borderRadius: 'var(--border-radius-lg)',
          }}
        >
          <Skeleton variant="rectangular" height={180} animation="wave" />
          <CardContent sx={{ flexGrow: 1, pb: 0 }}>
            <Skeleton variant="text" height={32} width="80%" animation="wave" />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5, mt: 1 }}>
              <Skeleton variant="rectangular" height={24} width={70} sx={{ borderRadius: 'var(--border-radius-sm)' }} animation="wave" />
              <Skeleton variant="rectangular" height={24} width={90} sx={{ borderRadius: 'var(--border-radius-sm)' }} animation="wave" />
            </Box>
            <Skeleton variant="text" height={20} animation="wave" />
            <Skeleton variant="text" height={20} animation="wave" />
            <Skeleton variant="text" height={20} width="60%" animation="wave" />
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Skeleton variant="text" height={16} width="30%" animation="wave" />
              <Skeleton variant="text" height={16} width="30%" animation="wave" />
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
            <Skeleton variant="circular" height={40} width={40} animation="wave" />
            <Box>
              <Skeleton variant="rectangular" height={36} width={100} sx={{ borderRadius: 'var(--border-radius-sm)', mr: 1, display: 'inline-block' }} animation="wave" />
              <Skeleton variant="rectangular" height={36} width={80} sx={{ borderRadius: 'var(--border-radius-sm)', display: 'inline-block' }} animation="wave" />
            </Box>
          </CardActions>
        </Card>
      </Fade>
    );
  }

  const { 
    title, 
    description, 
    snippet, 
    image_url, 
    source, 
    categories, 
    published_at, 
    url, 
    is_favorite 
  } = article;

  // Format the published date if available
  const formattedDate = published_at ? new Date(published_at).toLocaleDateString() : '';
  
  // Use snippet as fallback for description
  const displayDescription = description || snippet || '';
  
  // Default image if none provided
  const imageUrl = image_url || 'https://via.placeholder.com/300x200?text=No+Image';

  // Adjust button size and layout based on screen size
  const buttonSize = isMobile ? 'small' : 'medium';
  const buttonText = !isTablet ? { Read: 'Read Article', Summarize: 'Summarize' } : { Read: 'Read', Summarize: 'Summary' };

  return (
    <Fade in={true} timeout={600}>
      <Card 
        elevation={3}
        sx={{ 
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          backgroundColor: 'var(--bg-secondary)',
          color: 'var(--text-primary)',
          borderRadius: 'var(--border-radius-lg)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: 'var(--shadow-xl)',
            '& .article-image': {
              transform: 'scale(1.05)'
            }
          }
        }}
      >
        <Box sx={{ overflow: 'hidden', position: 'relative', height: 180 }}>
          <CardMedia
            component="img"
            height="180"
            image={imageUrl}
            alt={title}
            className="article-image"
            sx={{ 
              objectFit: 'cover',
              transition: 'transform 0.6s ease',
            }}
          />
          {source && (
            <Box 
              sx={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                right: 0,
                backgroundColor: 'rgba(0,0,0,0.6)',
                color: 'white',
                p: 0.5,
                px: 1,
                fontSize: '0.75rem',
                textAlign: 'right'
              }}
            >
              {source}
            </Box>
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pb: 0 }}>
          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 'bold',
              lineHeight: 1.3,
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {title}
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
            {categories && categories.map((category, index) => (
              <Chip 
                key={index} 
                label={category} 
                size="small" 
                color="primary" 
                variant="outlined"
                sx={{ 
                  borderRadius: 'var(--border-radius-sm)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'var(--primary-light)',
                    color: 'white',
                  }
                }}
              />
            ))}
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 1.5,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {displayDescription}
          </Typography>
          
          {formattedDate && (
            <Box sx={{ mt: 'auto', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {formattedDate}
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            p: isMobile ? 1 : 2,
            pt: 0,
            flexWrap: isTablet ? 'wrap' : 'nowrap'
          }}
        >
          <Tooltip title={is_favorite ? "Remove from favorites" : "Add to favorites"}>
            <IconButton 
              onClick={() => onToggleFavorite(article)}
              color="primary"
              aria-label={is_favorite ? "Remove from favorites" : "Add to favorites"}
              sx={{
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)'
                },
                color: is_favorite ? '#FFD700' : undefined
              }}
            >
              {is_favorite ? <StarIcon /> : <StarBorderIcon />}
            </IconButton>
          </Tooltip>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 1, mt: isTablet ? 1 : 0, width: isTablet ? '100%' : 'auto' }}>
            <Tooltip title="Summarize article">
              <Button
                startIcon={<SummarizeIcon />}
                onClick={() => onSummarize(article)}
                size={buttonSize}
                variant="contained"
                color="primary"
                sx={{ 
                  borderRadius: 'var(--border-radius-md)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                  }
                }}
              >
                {buttonText.Summarize}
              </Button>
            </Tooltip>
            
            <Tooltip title="Read full article">
              <Button
                startIcon={<OpenInNewIcon />}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                size={buttonSize}
                variant="outlined"
                sx={{ 
                  borderRadius: 'var(--border-radius-md)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-sm)',
                  }
                }}
              >
                {buttonText.Read}
              </Button>
            </Tooltip>
          </Box>
        </CardActions>
      </Card>
    </Fade>
  );
};

export default ArticleCard; 