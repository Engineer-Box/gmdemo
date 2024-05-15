import { useState, useEffect, Dispatch, SetStateAction } from "react";

type StoredValue<T> = T | null;

export const useLocalStorage = <T>(
  key: string,
  initialValue: T | null
): [StoredValue<T>, Dispatch<SetStateAction<StoredValue<T>>>] => {
  const [storedValue, _setStoredValue] = useState<StoredValue<T>>(initialValue);

  const updateStateAndLocalStorage = (newValue: StoredValue<T>) => {
    localStorage.setItem(key, JSON.stringify(newValue));
    _setStoredValue(newValue);
  };

  const setStoredValue = (
    value: StoredValue<T> | ((previous: StoredValue<T>) => StoredValue<T>)
  ) => {
    const newValue = value instanceof Function ? value(storedValue) : value;
    updateStateAndLocalStorage(newValue);
  };

  useEffect(() => {
    try {
      // intialise the state with the value from localstorage or the inital value
      const item = localStorage.getItem(key);
      updateStateAndLocalStorage(item ? JSON.parse(item) : initialValue);
    } catch (error) {
      console.error(error);
    }
  }, []);

  return [storedValue, setStoredValue];
};
