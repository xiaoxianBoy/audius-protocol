import { useCallback, useState } from 'react'

import { createPasswordPageMessages } from '@audius/common/messages'
import { passwordSchema } from '@audius/common/schemas'
import { setValueField } from 'common/store/pages/signon/actions'
import { Formik } from 'formik'
import { useDispatch } from 'react-redux'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { Flex } from '@audius/harmony-native'
import { KeyboardAvoidingView } from 'app/components/core'
import { PasswordField } from 'app/components/fields'
import { useNavigation } from 'app/hooks/useNavigation'

import { PasswordCompletionChecklist } from '../components/PasswordCompletionChecklist'
import { SignUpAgreementText } from '../components/SignUpPolicyText'
import { Heading, Page, PageFooter, ReadOnlyField } from '../components/layout'
import type { SignUpScreenParamList } from '../types'
import { useRoute } from '../useRoute'

export type CreatePasswordParams = {
  email: string
}

const initialValues = {
  password: '',
  confirmPassword: ''
}

type CreatePasswordValues = {
  password: string
  confirmPassword: string
}

const passwordFormikSchema = toFormikValidationSchema(passwordSchema)

export const CreatePasswordScreen = () => {
  const { params } = useRoute<'CreatePassword'>()
  const { email } = params
  const dispatch = useDispatch()
  const navigation = useNavigation<SignUpScreenParamList>()

  const handleSubmit = useCallback(
    (values: CreatePasswordValues) => {
      const { password } = values
      dispatch(setValueField('password', password))
      navigation.navigate('PickHandle')
    },
    [dispatch, navigation]
  )

  const [keyboardOffset, setKeyboardOffset] = useState(0)

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={passwordFormikSchema}
    >
      <KeyboardAvoidingView
        keyboardShowingOffset={keyboardOffset - 32}
        style={{ overflow: 'hidden' }}
      >
        <Page>
          <Heading
            heading={createPasswordPageMessages.createYourPassword}
            description={createPasswordPageMessages.description}
          />
          <Flex
            direction='column'
            h='100%'
            gap='l'
            onLayout={(e) => {
              e.currentTarget.measureInWindow((x, y, w, h) => {
                setKeyboardOffset(y)
              })
            }}
          >
            <ReadOnlyField
              label={createPasswordPageMessages.yourEmail}
              value={email}
            />
            <PasswordField
              name='password'
              label={createPasswordPageMessages.passwordLabel}
            />
            <PasswordField
              name='confirmPassword'
              label={createPasswordPageMessages.confirmPasswordLabel}
            />
            <PasswordCompletionChecklist />
          </Flex>
          <PageFooter prefix={<SignUpAgreementText />} />
        </Page>
      </KeyboardAvoidingView>
    </Formik>
  )
}
