import React, { createContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

export const LanguageContext = createContext();

/**
 * Provider component for language translation functionality
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} - The language provider
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // API configuration
  const API_KEY = 'AIzaSyDqkyW03Bw4A5rK1ZlJCzgkYvo0dMzDxjM';
  const API_URL = 'https://translation.googleapis.com/language/translate/v2';

  // Available languages
  const availableLanguages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'French' },
    { code: 'es', name: 'Spanish' },
    { code: 'de', name: 'German' }
  ];

  /**
   * Change the current language
   * @param {string} lang - Language code to change to
   */
  const changeLanguage = useCallback((lang) => {
    if (availableLanguages.some(l => l.code === lang)) {
      setLanguage(lang);
      localStorage.setItem('preferredLanguage', lang);
    }
  }, []);

  /**
   * Translate a single text
   * @param {string} text - Text to translate
   * @param {Object} options - Translation options
   * @returns {Promise<string>} - Translated text
   */
  const translateText = useCallback(async (text, options = {}) => {
    // If language is English or text is empty, return original text
    if (language === 'en' || !text || typeof text !== 'string') {
      return text;
    }

    // Check if we already have this translation cached
    const cacheKey = `${text}_${language}`;
    if (translations[cacheKey]) {
      return translations[cacheKey];
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          q: text,
          target: language,
          format: 'text'
        }
      );

      if (response.data && response.data.data && response.data.data.translations) {
        const translatedText = response.data.data.translations[0].translatedText;
        
        // Cache the translation
        setTranslations(prev => ({
          ...prev,
          [cacheKey]: translatedText
        }));
        
        return translatedText;
      }
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    } finally {
      setIsLoading(false);
    }
  }, [language, translations, API_KEY, API_URL]);

  /**
   * Translate multiple texts at once
   * @param {Array<string>} texts - Array of texts to translate
   * @param {Object} options - Translation options
   * @returns {Promise<Array<string>>} - Array of translated texts
   */
  const translateBatch = useCallback(async (texts, options = {}) => {
    if (language === 'en' || !texts || !texts.length) {
      return texts;
    }

    const validTexts = texts.filter(text => typeof text === 'string' && text.trim());
    if (!validTexts.length) return texts;

    try {
      setIsLoading(true);
      const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          q: validTexts,
          target: language,
          format: 'text'
        }
      );

      if (response.data && response.data.data && response.data.data.translations) {
        const translatedTexts = response.data.data.translations.map(t => t.translatedText);
        
        // Cache the translations
        const newTranslations = {};
        validTexts.forEach((text, index) => {
          const cacheKey = `${text}_${language}`;
          newTranslations[cacheKey] = translatedTexts[index];
        });
        
        setTranslations(prev => ({
          ...prev,
          ...newTranslations
        }));
        
        return translatedTexts;
      }
      return texts;
    } catch (error) {
      console.error('Batch translation error:', error);
      return texts;
    } finally {
      setIsLoading(false);
    }
  }, [language, API_KEY, API_URL]);

  // Load preferred language from localStorage on initial render
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage && availableLanguages.some(l => l.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        availableLanguages,
        changeLanguage,
        translateText,
        translateBatch,
        isLoading
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageProvider;
