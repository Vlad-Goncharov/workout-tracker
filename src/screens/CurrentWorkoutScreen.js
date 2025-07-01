// src/screens/CurrentWorkoutScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Appbar, Text, Button, TextInput, Card, IconButton, Dialog, Portal, Title, Paragraph } from 'react-native-paper';
import { getCurrentWorkout, saveCurrentWorkout, getDefinedExercises, saveWorkoutToHistory } from '../utils/storage';
import { colors } from '../theme/colors';
import PickerModal from '../components/PickerModal';

const CurrentWorkoutScreen = ({ navigation, route }) => {
  // Инициализируем с пустой тренировкой и массивом упражнений
  const [currentWorkout, setCurrentWorkout] = useState(null); // Будет загружен или создан
  const [loading, setLoading] = useState(true);
  const [activeExerciseId, setActiveExerciseId] = useState(null); // ID текущего выбранного упражнения
  const [newSetWeight, setNewSetWeight] = useState('');
  const [newSetReps, setNewSetReps] = useState('');
  const [newSetNotes, setNewSetNotes] = useState('');
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [setToDeleteInfo, setSetToDeleteInfo] = useState({ exerciseId: null, setIndex: null }); // Для удаления подхода
  const [isExercisePickerVisible, setIsExercisePickerVisible] = useState(false);
  const [definedExercises, setDefinedExercises] = useState([]); // Список всех определенных упражнений

  // Загружаем определенные упражнения для выбора
  useEffect(() => {
    const loadDefined = async () => {
      const exercises = await getDefinedExercises();
      setDefinedExercises(exercises || []);
    };
    loadDefined();
  }, []);

  const loadOrCreateWorkout = useCallback(async () => {
    setLoading(true);
    let workout = await getCurrentWorkout();

    if (!workout || route.params?.startNew) {
      workout = {
        id: Date.now().toString(), // Уникальный ID для всей тренировки
        startTime: new Date().toISOString(),
        endTime: null,
        exercises: [], // Массив для хранения упражнений в этой тренировке
      };
      await saveCurrentWorkout(workout);
    }
    // Убедимся, что exercises - это массив
    if (!workout.exercises) {
      workout.exercises = [];
    }

    setCurrentWorkout(workout);
    // Если есть упражнения, выбираем первое как активное при загрузке
    if (workout.exercises.length > 0 && !activeExerciseId) {
      setActiveExerciseId(workout.exercises[0].id);
    } else if (activeExerciseId && !workout.exercises.some(ex => ex.id === activeExerciseId)) {
        // Если активное упражнение удалили, или его нет, сбрасываем activeExerciseId
        setActiveExerciseId(null);
    }
    setLoading(false);
  }, [route.params?.startNew, activeExerciseId]); // Добавляем activeExerciseId в зависимости

  useEffect(() => {
    loadOrCreateWorkout();
  }, [loadOrCreateWorkout]);

  // Выбор/добавление нового упражнения в тренировку
  const handleSelectExercise = async (selectedExercise) => {
    if (!currentWorkout) return; // Не должно произойти, но на всякий случай

    const existingExercise = currentWorkout.exercises.find(
      (ex) => ex.id === selectedExercise.id
    );

    let updatedExercises;
    if (existingExercise) {
      // Упражнение уже есть, просто переключаемся на него
      updatedExercises = currentWorkout.exercises;
    } else {
      // Новое упражнение, добавляем его в список
      const newWorkoutExercise = {
        id: selectedExercise.id,
        name: selectedExercise.name,
        muscleGroup: selectedExercise.muscleGroup, // Добавляем группу мышц для аналитики
        sets: [],
        // Можно добавить startTime: new Date().toISOString() для каждого упражнения
      };
      updatedExercises = [...currentWorkout.exercises, newWorkoutExercise];
    }

    const updatedWorkout = { ...currentWorkout, exercises: updatedExercises };
    setCurrentWorkout(updatedWorkout);
    await saveCurrentWorkout(updatedWorkout);
    setActiveExerciseId(selectedExercise.id); // Делаем его активным
    setIsExercisePickerVisible(false);
  };

  const handleAddSet = async () => {
    if (!currentWorkout || !activeExerciseId) {
      Alert.alert('Ошибка', 'Пожалуйста, сначала выберите упражнение.');
      return;
    }
    if (!newSetWeight.trim() || !newSetReps.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, введите вес и количество повторений.');
      return;
    }

    const currentExerciseIndex = currentWorkout.exercises.findIndex(
      (ex) => ex.id === activeExerciseId
    );

    if (currentExerciseIndex === -1) {
      Alert.alert('Ошибка', 'Активное упражнение не найдено в тренировке.');
      return;
    }

    const activeExercise = currentWorkout.exercises[currentExerciseIndex];
    const newSet = {
      set: (activeExercise.sets.length || 0) + 1, // Нумерация подходов для текущего упражнения
      weight: parseFloat(newSetWeight),
      reps: parseInt(newSetReps),
      notes: newSetNotes.trim(),
      timestamp: new Date().toISOString(),
    };

    const updatedSets = [...activeExercise.sets, newSet];
    const updatedExercises = currentWorkout.exercises.map((ex, index) =>
      index === currentExerciseIndex ? { ...ex, sets: updatedSets } : ex
    );

    const updatedWorkout = { ...currentWorkout, exercises: updatedExercises };
    setCurrentWorkout(updatedWorkout);
    await saveCurrentWorkout(updatedWorkout);

    setNewSetWeight('');
    setNewSetReps('');
    setNewSetNotes('');
  };

  const showDeleteSetDialog = (exerciseId, setIndex) => {
    setSetToDeleteInfo({ exerciseId, setIndex });
    setDeleteDialogVisible(true);
  };

  const handleDeleteSet = async () => {
    if (!currentWorkout || setToDeleteInfo.exerciseId === null || setToDeleteInfo.setIndex === null) {
      return;
    }

    const { exerciseId, setIndex } = setToDeleteInfo;

    const updatedExercises = currentWorkout.exercises.map(ex => {
      if (ex.id === exerciseId) {
        const setsAfterDeletion = ex.sets.filter((_, i) => i !== setIndex);
        const renumberedSets = setsAfterDeletion.map((set, index) => ({ ...set, set: index + 1 }));
        return { ...ex, sets: renumberedSets };
      }
      return ex;
    });

    const updatedWorkout = { ...currentWorkout, exercises: updatedExercises };
    setCurrentWorkout(updatedWorkout);
    await saveCurrentWorkout(updatedWorkout);

    setDeleteDialogVisible(false);
    setSetToDeleteInfo({ exerciseId: null, setIndex: null });
  };

  const handleFinishWorkout = async () => {
    Alert.alert(
      "Завершить тренировку?",
      "Вы уверены, что хотите завершить текущую тренировку? Она будет сохранена в истории.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Завершить",
          onPress: async () => {
            // Проверяем, есть ли хоть одно упражнение с подходами
            const hasSets = currentWorkout?.exercises.some(ex => ex.sets.length > 0);

            if (currentWorkout && hasSets) {
              const finishedWorkout = {
                ...currentWorkout,
                endTime: new Date().toISOString(),
              };
              await saveWorkoutToHistory(finishedWorkout);
              await saveCurrentWorkout(null); // Очищаем активную тренировку
              setCurrentWorkout(null);
              setActiveExerciseId(null); // Сбрасываем активное упражнение
              navigation.navigate('HistoryTab');
              Alert.alert("Тренировка завершена!", "Прогресс сохранен.");
            } else {
              await saveCurrentWorkout(null); // Очищаем даже пустую тренировку
              setCurrentWorkout(null);
              setActiveExerciseId(null);
              navigation.navigate('HomeTab');
              Alert.alert("Тренировка отменена", "Не было записано ни одного подхода.");
            }
          },
        },
      ]
    );
  };

  const handleRemoveExerciseFromWorkout = async (exerciseIdToRemove) => {
      Alert.alert(
          "Удалить упражнение из тренировки?",
          "Вы уверены, что хотите удалить это упражнение со всеми подходами из текущей тренировки?",
          [
              { text: "Отмена", style: "cancel" },
              {
                  text: "Удалить",
                  onPress: async () => {
                      const updatedExercises = currentWorkout.exercises.filter(ex => ex.id !== exerciseIdToRemove);
                      const updatedWorkout = { ...currentWorkout, exercises: updatedExercises };
                      setCurrentWorkout(updatedWorkout);
                      await saveCurrentWorkout(updatedWorkout);

                      // Если удалили активное упражнение, сбрасываем активное
                      if (activeExerciseId === exerciseIdToRemove) {
                          setActiveExerciseId(updatedExercises.length > 0 ? updatedExercises[0].id : null);
                      }
                      Alert.alert("Удалено", "Упражнение удалено из текущей тренировки.");
                  },
              },
          ]
      );
  };


  const activeExercise = currentWorkout?.exercises?.find(ex => ex.id === activeExerciseId);
  const isWorkoutStarted = currentWorkout && currentWorkout.exercises.length > 0;

  if (loading || !currentWorkout) {
    return (
      <View style={styles.centered}>
        <Text>Загрузка тренировки...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
    >
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Текущая Тренировка" titleStyle={styles.appBarTitle} />
        {isWorkoutStarted && (
          <Appbar.Action icon="check-all" color={colors.onPrimary} onPress={handleFinishWorkout} />
        )}
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* Секция выбора/переключения упражнения */}
        <Card style={styles.exerciseSelectionCard}>
          <Card.Content>
            <Text style={styles.selectedExerciseLabel}>Текущее упражнение для добавления подходов:</Text>
            <Button
              mode="outlined"
              onPress={() => setIsExercisePickerVisible(true)}
              style={styles.selectExerciseButton}
              labelStyle={styles.selectExerciseButtonLabel}
              icon="chevron-down"
            >
              {activeExercise?.name || "Выберите упражнение"}
            </Button>
            {activeExercise && activeExercise.muscleGroup && (
                <Text style={styles.selectedExerciseMuscleGroup}>
                    Группа мышц: {activeExercise.muscleGroup}
                </Text>
            )}
          </Card.Content>
        </Card>

        {/* Секция добавления нового подхода */}
        <Card style={styles.addSetCard}>
          <Card.Content>
            <Text style={styles.addSetTitle}>Добавить подход к "{activeExercise?.name || 'выбранному упражнению'}"</Text>
            <TextInput
              label="Вес (кг)"
              value={newSetWeight}
              onChangeText={setNewSetWeight}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
            />
            <TextInput
              label="Повторения"
              value={newSetReps}
              onChangeText={setNewSetReps}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
            />
            <TextInput
              label="Примечания (необязательно)"
              value={newSetNotes}
              onChangeText={setNewSetNotes}
              mode="outlined"
              multiline
              numberOfLines={2}
              style={styles.input}
              theme={{ colors: { primary: colors.primary, underlineColor: 'transparent' } }}
            />
            <Button
              mode="contained"
              onPress={handleAddSet}
              style={styles.addSetButton}
              labelStyle={styles.addSetButtonLabel}
              disabled={!activeExerciseId}
            >
              Добавить подход
            </Button>
            {!activeExerciseId && (
              <Text style={styles.warningText}>
                Выберите упражнение, чтобы добавить подход.
              </Text>
            )}
          </Card.Content>
        </Card>

        {/* Отображение всех упражнений в тренировке и их подходов */}
        {currentWorkout.exercises.length === 0 ? (
          <Text style={styles.noExercisesText}>Добавьте первое упражнение в тренировку!</Text>
        ) : (
          currentWorkout.exercises.map((exercise) => (
            <Card key={exercise.id} style={styles.workoutExerciseCard}>
              <Card.Title
                title={exercise.name}
                subtitle={exercise.muscleGroup}
                titleStyle={styles.workoutExerciseTitle}
                subtitleStyle={styles.workoutExerciseSubtitle}
                right={(props) => (
                  <View style={styles.exerciseCardActions}>
                    <IconButton
                      {...props}
                      icon="plus-circle"
                      color={activeExerciseId === exercise.id ? colors.accent : colors.placeholder}
                      size={25}
                      onPress={() => setActiveExerciseId(exercise.id)}
                      tooltip="Сделать активным для добавления подходов"
                    />
                     <IconButton
                      {...props}
                      icon="delete"
                      color={colors.error}
                      size={25}
                      onPress={() => handleRemoveExerciseFromWorkout(exercise.id)}
                      tooltip="Удалить упражнение из тренировки"
                    />
                  </View>
                )}
              />
              <Card.Content>
                {exercise.sets.length === 0 ? (
                  <Text style={styles.noSetsTextInCard}>Нет записанных подходов.</Text>
                ) : (
                  exercise.sets.map((set, index) => (
                    <View key={`${exercise.id}-${index}`} style={styles.setRow}>
                      <Text style={styles.setRowText}>
                        <Text style={styles.setNumberInRow}>Подход {set.set}:</Text> {set.weight} кг x {set.reps} повт.
                        {set.notes ? ` (${set.notes})` : ''}
                      </Text>
                      <IconButton
                        icon="close-circle"
                        color={colors.placeholder}
                        size={18}
                        onPress={() => showDeleteSetDialog(exercise.id, index)}
                      />
                    </View>
                  ))
                )}
              </Card.Content>
            </Card>
          ))
        )}
        <View style={{ height: 50 }} /> {/* Отступ для клавиатуры */}
      </ScrollView>

      <PickerModal
        visible={isExercisePickerVisible}
        onClose={() => setIsExercisePickerVisible(false)}
        data={definedExercises}
        onSelect={handleSelectExercise}
        title="Выберите упражнение для тренировки"
        searchPlaceholder="Найти упражнение..."
      />

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Удалить подход?</Dialog.Title>
          <Dialog.Content>
            <Text>Вы уверены, что хотите удалить этот подход?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Отмена</Button>
            <Button onPress={handleDeleteSet} color={colors.error}>Удалить</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </KeyboardAvoidingView>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  exerciseSelectionCard: {
    marginBottom: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: colors.surface,
  },
  selectedExerciseLabel: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 5,
  },
  selectExerciseButton: {
    marginTop: 5,
    borderColor: colors.primary,
    borderWidth: 1,
    paddingVertical: 5,
  },
  selectExerciseButtonLabel: {
    fontSize: 18,
    color: colors.primary,
  },
  selectedExerciseMuscleGroup: {
      fontSize: 14,
      color: colors.placeholder,
      marginTop: 8,
      textAlign: 'center',
  },
  noExercisesText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: colors.placeholder,
  },
  addSetCard: {
    marginTop: 10,
    marginBottom: 20, // Отступ от других карт
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    backgroundColor: colors.surface,
  },
  addSetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: colors.primary,
  },
  input: {
    marginBottom: 10,
    backgroundColor: colors.surface,
  },
  addSetButton: {
    marginTop: 15,
    backgroundColor: colors.accent,
    paddingVertical: 8,
  },
  addSetButtonLabel: {
    fontSize: 16,
    color: colors.text,
  },
  warningText: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    marginTop: 10,
  },
  workoutExerciseCard: {
      marginVertical: 8,
      borderRadius: 10,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      backgroundColor: colors.surface,
      overflow: 'hidden', // Чтобы Card.Title не вылезал за границы скругления
  },
  workoutExerciseTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
  },
  workoutExerciseSubtitle: {
      fontSize: 14,
      color: colors.placeholder,
  },
  exerciseCardActions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: -10, // Чтобы кнопки были ближе к краю
  },
  setRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 5,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.placeholder + '50',
  },
  setRowText: {
      flex: 1, // Позволяет тексту занимать все доступное пространство
      fontSize: 15,
      color: colors.text,
  },
  setNumberInRow: {
      fontWeight: 'bold',
      color: colors.primary,
  },
  noSetsTextInCard: {
      fontSize: 14,
      color: colors.placeholder,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: 10,
  }
});

export default CurrentWorkoutScreen;