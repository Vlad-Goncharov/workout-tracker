// src/navigation/AppNavigator.js
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons'; // Убедитесь, что это импорт Ionicons


// Импорт экранов
import HomeScreen from '../screens/HomeScreen';
import CurrentWorkoutScreen from '../screens/CurrentWorkoutScreen'; // Убедитесь, что этот экран импортирован
import ExerciseLibraryScreen from '../screens/ExerciseLibraryScreen';
import PastWorkoutsScreen from '../screens/PastWorkoutsScreen';
import ExerciseDetailScreen from '../screens/ExerciseDetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const LibraryStack = createNativeStackNavigator();
const HistoryStack = createNativeStackNavigator();

// Home Stack (Home + CurrentWorkout) - остается, чтобы можно было переходить с Home на CurrentWorkout
function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="CurrentWorkout" component={CurrentWorkoutScreen} />
    </HomeStack.Navigator>
  );
}

// Library Stack (ExerciseLibrary + ExerciseDetail)
function LibraryStackScreen() {
  return (
    <LibraryStack.Navigator screenOptions={{ headerShown: false }}>
      <LibraryStack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <LibraryStack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    </LibraryStack.Navigator>
  );
}

// History Stack (PastWorkouts)
function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="PastWorkouts" component={PastWorkoutsScreen} />
    </HistoryStack.Navigator>
  );
}

function AppNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 32;

          // ИМЕНА ИКОНОК ДЛЯ IONICONS
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'WorkoutTab') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'LibraryTab') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'HistoryTab') {
            iconName = focused ? 'time' : 'time-outline';
          }
          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.placeholder,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.25,
          shadowRadius: 6,
          height: 110,
          paddingVertical: 10,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          marginBottom: 5,
        },
        tabBarActiveBackgroundColor: 'transparent',
        tabBarInactiveBackgroundColor: 'transparent',
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
        }
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackScreen} options={{ tabBarLabel: 'Главная' }} />
      {/* ИЗМЕНЕНИЕ ЗДЕСЬ: Теперь WorkoutTab напрямую ведет на CurrentWorkoutScreen */}
      <Tab.Screen name="WorkoutTab" component={CurrentWorkoutScreen} options={{ tabBarLabel: 'Тренировка' }} />
      <Tab.Screen name="LibraryTab" component={LibraryStackScreen} options={{ tabBarLabel: 'Упражнения' }} />
      <Tab.Screen name="HistoryTab" component={HistoryStackScreen} options={{ tabBarLabel: 'История' }} />
    </Tab.Navigator>
  );
}

export default AppNavigator;