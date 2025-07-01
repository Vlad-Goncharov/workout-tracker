// src/utils/storage.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFINED_EXERCISES_KEY = '@workoutTracker:definedExercises';
const CURRENT_WORKOUT_KEY = '@workoutTracker:currentWorkout';
const WORKOUT_HISTORY_KEY = '@workoutTracker:workoutHistory'; 

// --- Functions for Defined Exercises (Library) ---
export const saveDefinedExercises = async (exercises) => {
  try {
    // Убедимся, что exercises - это массив и корректно преобразуем его в строку JSON
    await AsyncStorage.setItem(DEFINED_EXERCISES_KEY, JSON.stringify(exercises));
    console.log('Упражнения успешно сохранены:', exercises.length, 'шт.'); // Для отладки
  } catch (error) {
    console.error("Ошибка при сохранении определенных упражнений:", error);
  }
};
export const getDefinedExercises = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(DEFINED_EXERCISES_KEY);
    // Возвращаем пустой массив, если упражнения не найдены или есть ошибка парсинга
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Ошибка при получении определенных упражнений:", error);
    // Важно: возвращаем пустой массив в случае ошибки, чтобы не было 'undefined'
    return [];
  }
};

// --- Functions for Current Workout ---
export const saveCurrentWorkout = async (workout) => {
  try {
    // Важно: если workout равен null (т.е. тренировка завершена или отменена),
    // мы удаляем ключ, чтобы не хранить пустые данные.
    if (workout === null) {
      await AsyncStorage.removeItem(CURRENT_WORKOUT_KEY);
      console.log('Текущая тренировка удалена из хранилища.');
    } else {
      // Сохраняем объект тренировки
      await AsyncStorage.setItem(CURRENT_WORKOUT_KEY, JSON.stringify(workout));
      console.log('Текущая тренировка успешно сохранена.');
    }
  } catch (error) {
    console.error("Ошибка при сохранении текущей тренировки:", error);
  }
};

export const getCurrentWorkout = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(CURRENT_WORKOUT_KEY);
    // Возвращаем null, если текущая тренировка не найдена (нет активной)
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error("Ошибка при получении текущей тренировки:", error);
    // Важно: возвращаем null в случае ошибки
    return null;
  }
};

// --- NEW Functions for Workout History ---
export const saveWorkoutToHistory = async (workout) => {
  try {
    const history = await getWorkoutHistory();
    const updatedHistory = [...history, { ...workout, id: Date.now().toString() }]; // Добавляем ID для уникальности
    await AsyncStorage.setItem(WORKOUT_HISTORY_KEY, JSON.stringify(updatedHistory));
  } catch (error) {
    console.error("Error saving workout to history:", error);
  }
};

export const getWorkoutHistory = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(WORKOUT_HISTORY_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (error) {
    console.error("Error getting workout history:", error);
    return [];
  }
};

export const clearWorkoutHistory = async () => { // Опционально: функция для очистки истории
  try {
    await AsyncStorage.removeItem(WORKOUT_HISTORY_KEY);
  } catch (error) {
    console.error("Error clearing workout history:", error);
  }
};