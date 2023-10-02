import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { CreatePasswordScreen } from './screens/CreatePasswordScreen'
import { SignUpScreen } from './screens/SignUpScreen'

const Stack = createNativeStackNavigator()
const screenOptions = { animationTypeForReplace: 'pop' as const }

export const SignUpRootScreen = () => {
  return (
    <Stack.Navigator initialRouteName='SignUp' screenOptions={screenOptions}>
      <Stack.Screen name='SignUp' component={SignUpScreen} />
      <Stack.Screen name='CreatePassword' component={CreatePasswordScreen} />
    </Stack.Navigator>
  )
}