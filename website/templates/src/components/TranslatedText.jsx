import React, { useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { LanguageContext } from '../contexts/LanguageContext';

/**
 * A component that automatically translates its text content based on the selected language.
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The text content to be translated
 * @param {Object} props.options - Additional options for translation
 * @returns {React.ReactElement} - The translated text
 */
const TranslatedText = ({ children, options = {} }) => {
  const { language, translateText } = useContext(LanguageContext);
  const [translatedContent, setTranslatedContent] = useState(children);
  const [originalText] = useState(children);

  useEffect(() => {
    // Skip translation if not a string or if language is English
    if (typeof children !== 'string' || language === 'en') {
      setTranslatedContent(children);
      return;
    }

    // Translate the text when language changes or children changes
    const performTranslation = async () => {
      try {
        const result = await translateText(children, options);
        setTranslatedContent(result);
      } catch (error) {
        console.error('Translation error in TranslatedText component:', error);
        // Fallback to original text on error
        setTranslatedContent(originalText);
      }
    };

    performTranslation();
  }, [children, language, translateText, options, originalText]);

  return <>{translatedContent}</>;
};

TranslatedText.propTypes = {
  children: PropTypes.node.isRequired,
  options: PropTypes.object
};

export default TranslatedText;
