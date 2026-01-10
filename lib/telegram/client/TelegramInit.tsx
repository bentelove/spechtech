
import { useRawInitData } from '@telegram-apps/sdk-react';
import { useEffect } from 'react';

export default function TelegramInit() {
  const rawInitData = useRawInitData();
  useEffect(() => {
    if (rawInitData) {
      localStorage.setItem('token', rawInitData);
    }
  }, [rawInitData]);
  if(rawInitData){
    return <>
      <pre>{JSON.stringify(rawInitData, null, 2)}</pre>
    </>;
  }
  return null;
}