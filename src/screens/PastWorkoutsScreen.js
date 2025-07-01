// src/screens/PastWorkoutsScreen.js
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native';
import { Appbar, Text, Card, Title, Paragraph, Button, Dialog, Portal } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getWorkoutHistory, clearWorkoutHistory } from '../utils/storage';
import { colors } from '../theme/colors';

const PastWorkoutsScreen = ({ navigation }) => {
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [clearHistoryDialogVisible, setClearHistoryDialogVisible] = useState(false);

  const loadWorkoutHistory = useCallback(async () => {
    const history = await getWorkoutHistory();
    // Сортируем историю от новых к старым
    setWorkoutHistory(history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)) || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWorkoutHistory();
    }, [loadWorkoutHistory])
  );

  const formatDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return "N/A";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    if (isNaN(diffMs) || diffMs < 0) return "N/A"; // Обработка невалидных дат

    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours} ч ${remainingMinutes} мин`;
    }
    return `${minutes} мин`;
  };

  const confirmClearHistory = () => {
    setClearHistoryDialogVisible(true);
  };

  const handleClearHistory = async () => {
    await clearWorkoutHistory();
    setWorkoutHistory([]);
    setClearHistoryDialogVisible(false);
    Alert.alert('Успех', 'История тренировок очищена.');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="История Тренировок" titleStyle={styles.appBarTitle} />
        {workoutHistory.length > 0 && (
          <Appbar.Action icon="delete-sweep" color={colors.onPrimary} onPress={confirmClearHistory} />
        )}
      </Appbar.Header>

      {workoutHistory.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>История тренировок пуста.</Text>
          <Text style={styles.emptyText}>Завершите свою первую тренировку!</Text>
        </View>
      ) : (
        <FlatList
          data={workoutHistory}
          keyExtractor={(item) => item.id}
          renderItem={({ item: workout }) => ( // Переименовал item в workout для ясности
            <Card style={styles.workoutCard}>
              <Card.Content>
                <Text style={styles.workoutCardTitle}>
                  Тренировка от {new Date(workout.startTime).toLocaleDateString('ru-RU', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </Text>
                <Text style={styles.workoutCardSubtitle}>
                  Длительность: {formatDuration(workout.startTime, workout.endTime)}
                </Text>

                {workout.exercises && workout.exercises.length > 0 ? (
                  workout.exercises.map((exercise, exIndex) => (
                    <View key={exercise.id + exIndex} style={styles.exerciseSection}>
                      <Text style={styles.exerciseNameText}>{exercise.name}</Text>
                      {exercise.muscleGroup && (
                          <Text style={styles.exerciseMuscleGroupText}>({exercise.muscleGroup})</Text>
                      )}
                      {exercise.sets && exercise.sets.length > 0 ? (
                        exercise.sets.map((set, setIndex) => (
                          <Text key={`${exercise.id}-${setIndex}`} style={styles.setText}>
                            Подход {set.set}: {set.weight} кг x {set.reps} повт.
                            {set.notes ? ` (${set.notes})` : ''}
                          </Text>
                        ))
                      ) : (
                        <Text style={styles.noSetsInHistoryText}>Нет записанных подходов.</Text>
                      )}
                    </View>
                  ))
                ) : (
                  <Text style={styles.noExercisesInHistoryText}>В этой тренировке нет записанных упражнений.</Text>
                )}
              </Card.Content>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Portal>
        <Dialog visible={clearHistoryDialogVisible} onDismiss={() => setClearHistoryDialogVisible(false)}>
          <Dialog.Title>Очистить историю?</Dialog.Title>
          <Dialog.Content>
            <Text>Вы уверены, что хотите полностью очистить историю тренировок?</Text>
            <Text style={styles.warningText}>Это действие необратимо!</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setClearHistoryDialogVisible(false)}>Отмена</Button>
            <Button onPress={handleClearHistory} color={colors.error}>Очистить</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: colors.placeholder,
    textAlign: 'center',
    marginBottom: 5,
  },
  listContent: {
    paddingVertical: 16,
    paddingBottom: 20,
  },
  workoutCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: colors.surface,
    paddingBottom: 10, // Добавим небольшой отступ снизу для красоты
  },
  workoutCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  workoutCardSubtitle: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 15,
  },
  exerciseSection: {
    backgroundColor: colors.background, // Отделяем секции упражнений
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.placeholder + '30',
  },
  exerciseNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 2,
  },
  exerciseMuscleGroupText: {
      fontSize: 13,
      color: colors.placeholder,
      fontStyle: 'italic',
      marginBottom: 5,
  },
  setText: {
    fontSize: 14,
    color: colors.text,
    marginLeft: 5, // Отступ для подходов
  },
  noSetsInHistoryText: {
    fontSize: 13,
    color: colors.placeholder,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  noExercisesInHistoryText: {
      fontSize: 14,
      color: colors.placeholder,
      fontStyle: 'italic',
      textAlign: 'center',
      marginTop: 10,
  },
  warningText: {
    color: colors.error,
    marginTop: 10,
    fontWeight: 'bold',
  }
});

export default PastWorkoutsScreen;