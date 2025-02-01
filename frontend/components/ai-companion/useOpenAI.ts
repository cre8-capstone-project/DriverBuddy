import {useState} from 'react';
import axios from 'axios';

export const useOpenAI = () => {
  const [loading, setLoading] = useState(false);

  const alertDrowsiness = async (): Promise<string> => {
    const startTime = performance.now();
    setLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content:
                'The driver seems to be feeling drowsy. Please create a concise and casual message that sounds more like someone is directly speaking to them to alert them.',
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const endTime = performance.now();
      const duration = endTime - startTime;
      console.log(`OpenAI API Response Time: ${duration.toFixed(2)} ms`);

      const message = response.data.choices[0].message.content;
      return message;
    } catch (error) {
      console.error(error);
      return 'An error occurred while fetching the warning message.';
    } finally {
      setLoading(false);
    }
  };

  return {alertDrowsiness, isAlerting: loading};
};
