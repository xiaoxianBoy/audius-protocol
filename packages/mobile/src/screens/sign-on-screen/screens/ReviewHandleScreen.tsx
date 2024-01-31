import { useCallback, useMemo } from 'react'

import { useAudiusQueryContext } from '@audius/common/audius-query'
import { reviewHandlePageMessages } from '@audius/common/messages'
import { pickHandleSchema } from '@audius/common/schemas'
import { setValueField } from 'audius-client/src/common/store/pages/signon/actions'
import {
  getCoverPhotoField,
  getHandleField,
  getLinkedSocialOnFirstPage,
  getProfileImageField
} from 'audius-client/src/common/store/pages/signon/selectors'
import { Formik } from 'formik'
import { useDispatch, useSelector } from 'react-redux'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { Paper } from '@audius/harmony-native'
import { useNavigation } from 'app/hooks/useNavigation'

import { ReadOnlyAccountHeader } from '../components/AccountHeader'
import { HandleField } from '../components/HandleField'
import { Heading, Page, PageFooter } from '../components/layout'
import type { SignUpScreenParamList } from '../types'
import { restrictedHandles } from '../utils/restrictedHandles'

type ReviewHandleValues = {
  handle: string
}

// Users land here if their handle doesn't work with our validation for some reason
export const ReviewHandleScreen = () => {
  const dispatch = useDispatch()
  const { value: handle } = useSelector(getHandleField)
  const coverPhoto = useSelector(getCoverPhotoField)
  const profileImage = useSelector(getProfileImageField)
  const hasImages = coverPhoto || profileImage
  const initialValues = {
    handle
  }
  const audiusQueryContext = useAudiusQueryContext()
  const navigation = useNavigation<SignUpScreenParamList>()
  const isLinkingSocialOnFirstPage = useSelector(getLinkedSocialOnFirstPage)

  const validationSchema = useMemo(() => {
    return toFormikValidationSchema(
      pickHandleSchema({ audiusQueryContext, restrictedHandles })
    )
  }, [audiusQueryContext])

  const handleSubmit = useCallback(
    (values: ReviewHandleValues) => {
      const { handle } = values
      dispatch(setValueField('handle', handle))
      navigation.navigate(
        isLinkingSocialOnFirstPage ? 'CreateLoginDetails' : 'FinishProfile'
      )
    },
    [dispatch, navigation, isLinkingSocialOnFirstPage]
  )

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validationSchema={validationSchema}
      validateOnMount
      validateOnChange={false}
      initialTouched={{ handle: true }}
    >
      {({ isValid }) => (
        <Page>
          <Heading
            heading={reviewHandlePageMessages.heading}
            description={reviewHandlePageMessages.description}
          />
          {hasImages ? (
            <Paper gap='xl' direction='column'>
              <ReadOnlyAccountHeader />
              <HandleField />
            </Paper>
          ) : (
            <HandleField />
          )}
          <PageFooter buttonProps={{ disabled: !isValid }} />
        </Page>
      )}
    </Formik>
  )
}
