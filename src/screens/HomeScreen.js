// src/screens/HomeScreen.js
import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getDefinedExercises } from '../utils/storage';
import { colors } from '../theme/colors';

const HomeScreen = ({ navigation }) => {
  const [definedExercises, setDefinedExercises] = useState([]);

  const loadDefinedExercises = useCallback(async () => {
    const storedExercises = await getDefinedExercises();
    setDefinedExercises(storedExercises || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDefinedExercises();
    }, [loadDefinedExercises])
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Главная" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      <View style={styles.content}>
        <Text style={styles.greetingText}>Добро пожаловать в Трекер Тренировок!</Text>
        <Text style={styles.infoText}>
          Здесь вы можете начать новую тренировку или управлять своей библиотекой упражнений.
        </Text>

        {/* Кастомная кнопка "Начать новую тренировку" */}
        <TouchableOpacity
          style={styles.customButton}
          // ИЗМЕНЕНИЕ ЗДЕСЬ: Явно указываем экран 'CurrentWorkout' внутри 'WorkoutTab'
          onPress={() => navigation.navigate('WorkoutTab', { screen: 'CurrentWorkout', params: { startNew: true } })}
          activeOpacity={0.7}
        >
          <Text style={styles.customButtonText}>Начать новую тренировку</Text>
        </TouchableOpacity>

        {/* Кастомная кнопка "Моя библиотека упражнений" */}
        <TouchableOpacity
          style={[styles.customButton, styles.customButtonOutline]}
          onPress={() => navigation.navigate('LibraryTab')}
          activeOpacity={0.7}
        >
          <Text style={[styles.customButtonText, styles.customButtonOutlineText]}>
            Моя библиотека упражнений ({definedExercises?.length || 0})
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    backgroundColor: colors.primary,
  },
  appBarTitle: {
    color: colors.onPrimary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 15,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: colors.placeholder,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  customButton: {
    width: '80%',
    paddingVertical: 15,
    marginVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  customButtonText: {
    fontSize: 16,
    color: colors.onPrimary,
    fontWeight: 'bold',
  },
  customButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    elevation: 0,
    shadowOpacity: 0,
  },
  customButtonOutlineText: {
    color: colors.primary,
  },
});

export default HomeScreen;