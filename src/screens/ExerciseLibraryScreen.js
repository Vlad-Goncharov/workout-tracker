// src/screens/ExerciseLibraryScreen.js
import React, { useState, useCallback } from 'react';
import { View, FlatList, StyleSheet, Alert, ScrollView } from 'react-native'; // <-- Добавь ScrollView здесь
import { Appbar, FAB, TextInput, Button, Card, Title, Paragraph, IconButton, Dialog, Portal, Text } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';
import { getDefinedExercises, saveDefinedExercises } from '../utils/storage';
import { colors } from '../theme/colors';

const muscleGroups = [
  'Грудь', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс',
  'Пресс', 'Кардио', 'Все тело', 'Другое'
];

const ExerciseLibraryScreen = ({ navigation }) => {
  const [definedExercises, setDefinedExercises] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseMuscleGroup, setNewExerciseMuscleGroup] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editExerciseId, setEditExerciseId] = useState(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [exerciseToDeleteId, setExerciseToDeleteId] = useState(null);

  const loadDefinedExercises = useCallback(async () => {
    const exercises = await getDefinedExercises();
    setDefinedExercises(exercises || []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDefinedExercises();
    }, [loadDefinedExercises])
  );

  const handleSaveExercise = async () => {
    if (!newExerciseName.trim()) {
      Alert.alert('Ошибка', 'Название упражнения не может быть пустым.');
      return;
    }

    const exerciseData = {
      id: isEditing ? editExerciseId : Date.now().toString(),
      name: newExerciseName.trim(),
      muscleGroup: newExerciseMuscleGroup.trim(),
      description: newExerciseDescription.trim(),
    };

    let updatedExercises;
    if (isEditing) {
      updatedExercises = definedExercises.map(ex =>
        ex.id === editExerciseId ? exerciseData : ex
      );
    } else {
      updatedExercises = [...definedExercises, exerciseData];
    }

    await saveDefinedExercises(updatedExercises);
    setDefinedExercises(updatedExercises);
    resetForm();
    setIsAdding(false);
    setIsEditing(false);
    Alert.alert('Успех', isEditing ? 'Упражнение обновлено!' : 'Упражнение добавлено в библиотеку!');
  };

  const resetForm = () => {
    setNewExerciseName('');
    setNewExerciseMuscleGroup('');
    setNewExerciseDescription('');
    setEditExerciseId(null);
  };

  const handleEditExercise = (exercise) => {
    setNewExerciseName(exercise.name);
    setNewExerciseMuscleGroup(exercise.muscleGroup);
    setNewExerciseDescription(exercise.description);
    setEditExerciseId(exercise.id);
    setIsEditing(true);
    setIsAdding(true); // Show the form for editing
  };

  const showDeleteDialog = (id) => {
    setExerciseToDeleteId(id);
    setDeleteDialogVisible(true);
  };

  const handleDeleteExercise = async () => {
    const updatedExercises = definedExercises.filter(ex => ex.id !== exerciseToDeleteId);
    await saveDefinedExercises(updatedExercises);
    setDefinedExercises(updatedExercises);
    setDeleteDialogVisible(false);
    setExerciseToDeleteId(null);
    Alert.alert('Успех', 'Упражнение удалено.');
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appBar}>
        <Appbar.Content title="Моя Библиотека Упражнений" titleStyle={styles.appBarTitle} />
      </Appbar.Header>

      {isAdding ? (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <TextInput
            label="Название упражнения"
            value={newExerciseName}
            onChangeText={setNewExerciseName}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: colors.primary } }}
          />
          <TextInput
            label="Группа мышц (напр., Грудь, Ноги)"
            value={newExerciseMuscleGroup}
            onChangeText={setNewExerciseMuscleGroup}
            mode="outlined"
            style={styles.input}
            theme={{ colors: { primary: colors.primary } }}
          />
          <TextInput
            label="Описание (необязательно)"
            value={newExerciseDescription}
            onChangeText={setNewExerciseDescription}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            theme={{ colors: { primary: colors.primary } }}
          />
          <Button
            mode="contained"
            onPress={handleSaveExercise}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
          >
            {isEditing ? 'Сохранить изменения' : 'Добавить в библиотеку'}
          </Button>
          <Button
            mode="outlined"
            onPress={() => { setIsAdding(false); setIsEditing(false); resetForm(); }}
            style={styles.cancelButton}
            labelStyle={styles.cancelButtonLabel}
          >
            Отмена
          </Button>
        </ScrollView>
      ) : (
        <>
          {definedExercises.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Библиотека упражнений пуста.</Text>
              <Text style={styles.emptyText}>Добавьте свои упражнения!</Text>
            </View>
          ) : (
            <FlatList
              data={definedExercises}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card style={styles.exerciseCard}>
                  <Card.Content>
                    <View style={styles.exerciseCardHeader}>
                      <Title style={styles.cardTitle}>{item.name}</Title>
                      <View style={styles.cardActions}>
                        <IconButton
                          icon="pencil"
                          color={colors.primary}
                          size={20}
                          onPress={() => handleEditExercise(item)}
                        />
                        <IconButton
                          icon="delete"
                          color={colors.error}
                          size={20}
                          onPress={() => showDeleteDialog(item.id)}
                        />
                      </View>
                    </View>
                    {item.muscleGroup && (
                      <Paragraph style={styles.cardSubtitle}>
                        Группа мышц: {item.muscleGroup}
                      </Paragraph>
                    )}
                    {item.description && (
                      <Paragraph style={styles.cardDescription}>
                        {item.description}
                      </Paragraph>
                    )}
                  </Card.Content>
                </Card>
              )}
              contentContainerStyle={styles.listContent}
            />
          )}
          <FAB
            style={styles.fab}
            icon="plus"
            label="Добавить упражнение"
            onPress={() => setIsAdding(true)}
          />
        </>
      )}

      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title>Удалить упражнение?</Dialog.Title>
          <Dialog.Content>
            <Text>Вы уверены, что хотите удалить это упражнение из библиотеки?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Отмена</Button>
            <Button onPress={handleDeleteExercise} color={colors.error}>Удалить</Button>
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
  formContainer: {
    padding: 20,
  },
  input: {
    marginBottom: 15,
    backgroundColor: colors.surface,
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: colors.primary,
    paddingVertical: 8,
  },
  saveButtonLabel: {
    fontSize: 16,
  },
  cancelButton: {
    marginTop: 10,
    borderColor: colors.primary,
    borderWidth: 1,
  },
  cancelButtonLabel: {
    color: colors.primary,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 80,
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
  exerciseCard: {
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: colors.surface,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1, // Allows title to take available space
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.placeholder,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.text,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.accent,
  },
});

export default ExerciseLibraryScreen;