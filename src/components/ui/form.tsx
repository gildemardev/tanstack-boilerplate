/* eslint-disable @typescript-eslint/no-explicit-any, react/no-children-prop */

import { useField, useForm as useTanStackForm } from '@tanstack/react-form'
import { zodValidator } from '@tanstack/react-form-zod-adapter'
import type { DeepKeys, DeepValue, FieldApi, FormOptions, Validator } from '@tanstack/react-form'
import type { UseFieldOptions } from 'node_modules/@tanstack/react-form/dist/esm/types'
import type { ChangeEvent, ComponentProps, FC, ReactNode } from 'react'
import type { Except } from 'type-fest'
import type { z } from 'zod'

import { Button } from '~/components/ui/button'
import { Label } from '~/components/ui/label'
import { Slot } from '~/components/ui/slot'
import { createContextFactory, cx } from '~/libs/utils'
import type { AsChildProps } from '~/components/ui/slot'

interface FieldLabelProps extends ComponentProps<typeof Label> {}
interface FieldDetailProps extends ComponentProps<'p'>, AsChildProps {}
interface FieldMessageProps extends ComponentProps<'p'>, AsChildProps {}
interface FieldContainerProps extends ComponentProps<'div'> {
  label?: string
  detail?: string
  message?: string
  disableController?: boolean
}
interface FieldControllerProps extends ComponentProps<typeof Slot> {}

interface FieldApiExtended<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined,
  TFormValidator extends Validator<TParentData, unknown> | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>,
> extends FieldApi<TParentData, TName, TFieldValidator, TFormValidator, TData> {
  Label: FC<FieldLabelProps>
  Detail: FC<FieldDetailProps>
  Message: FC<FieldMessageProps>
  Container: FC<FieldContainerProps>
  Controller: FC<FieldControllerProps>
  handleChangeExtended: (value: any) => void
}

interface FieldComponentProps<
  TParentData,
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined,
  TFormValidator extends Validator<TParentData, unknown> | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>,
> extends UseFieldOptions<TParentData, TName, TFieldValidator, TFormValidator, TData> {
  render: (fieldApi: FieldApiExtended<TParentData, TName, TFieldValidator, TFormValidator, TData>) => ReactNode
}

type FieldComponent<
  TParentData,
  TFormValidator extends Validator<TParentData, unknown> | undefined = undefined,
> = <
  TName extends DeepKeys<TParentData>,
  TFieldValidator extends Validator<DeepValue<TParentData, TName>, unknown> | undefined = undefined,
  TData extends DeepValue<TParentData, TName> = DeepValue<TParentData, TName>,
>({ render, ...fieldOptions }: Except<FieldComponentProps<TParentData, TName, TFieldValidator, TFormValidator, TData>, 'form'>) => ReactNode

type AnyFieldApi = FieldApi<any, any, any, any, any>

const [FieldContextProvider, useFieldContext] = createContextFactory<AnyFieldApi>()

function useForm<
  TFormSchema extends z.ZodType,
  TFormData = z.infer<TFormSchema>,
>(
  schema: TFormSchema,
  options?: Except<FormOptions<TFormData, Validator<TFormData>>, 'validatorAdapter'>,
) {
  const form = useTanStackForm({
    validatorAdapter: zodValidator({
      transformErrors: (errors) => errors.map((e) => e.message)[0],
    }),
    validators: {
      onChange: schema,
    },
    ...options,
  })

  const FormRoot = ({ className, ...props }: ComponentProps<'form'>) => (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className={cx('w-full space-y-6 lg:max-w-sm', className)}
      {...props}
    />
  )

  const FormField: FieldComponent<TFormData, Validator<TFormData>> = (props) => (
    <form.Field
      children={(field) => (
        <FieldContextProvider value={field}>
          {props.render(
            {
              ...field,
              Label: FieldLabel,
              Detail: FieldDetail,
              Message: FieldMessage,
              Container: FieldContainer,
              Controller: FieldController,
              handleChangeExtended: handleChangeExtended(field),
            } as any,
          )}
        </FieldContextProvider>
      )}
      {...props}

    />
  )

  const FormSubmit = ({ className, ...props }: ComponentProps<typeof Button>) => (
    <form.Subscribe
      children={(state) => (
        <Button
          type='submit'
          disabled={state.isSubmitting || !state.canSubmit}
          className={cx('w-full', className)}
          {...props}
        />
      )}
    />
  )

  return {
    ...form,
    Root: FormRoot,
    Field: FormField,
    Submit: FormSubmit,
  }
}

function FieldLabel({ className, children, ...props }: FieldLabelProps) {
  const fieldContext = useFieldContext()
  const field = useField({ form: fieldContext.form, name: fieldContext.name })

  const isTouched = field.state.meta.isTouched
  const hasErrors = field.state.meta.errors.length > 0
  const hasChildren = children !== undefined

  if (!hasChildren) return null

  return (
    <Label
      htmlFor={field.name.toString()}
      className={cx('font-semibold',
        isTouched && hasErrors && 'text-destructive',
        className,
      )}
      {...props}
    >
      {children}
    </Label>
  )
}

function FieldDetail({ asChild, className, children, ...props }: FieldDetailProps) {
  const Comp = asChild ? Slot : 'p'

  const hasChildren = children !== undefined

  if (!hasChildren) return null

  return (
    <Comp
      className='text-sm text-muted-foreground'
      {...props}
    >
      {children}
    </Comp>
  )
}

function FieldMessage({ asChild, className, children, ...props }: FieldMessageProps) {
  const fieldContext = useFieldContext()
  const field = useField({ form: fieldContext.form, name: fieldContext.name })

  const Comp = asChild ? Slot : 'p'

  const isTouched = field.state.meta.isTouched
  const hasErrors = field.state.meta.errors.length > 0
  const hasPlaceholder = children !== undefined

  const message = isTouched && hasErrors ? field.state.meta.errors[0] : null

  if (!hasPlaceholder && !message) return null

  return (
    <Comp
      className={cx(
        'text-sm',
        isTouched && hasErrors ? 'font-medium text-destructive' : 'text-muted-foreground',
        className,
      )}
      {...props}
    >
      {message || children}
    </Comp>
  )
}

function FieldContainer({ label, detail, message, disableController, className, children, ...props }: FieldContainerProps) {
  return (
    <div
      className={cx('space-y-4', className)}
      {...props}
    >
      <FieldLabel>
        {label}
      </FieldLabel>
      <FieldDetail>
        {detail}
      </FieldDetail>
      {disableController ? children : (
        <FieldController>
          {children}
        </FieldController>
      )}
      <FieldMessage>
        {message}
      </FieldMessage>
    </div>
  )
}

function FieldController( { children, ...props }: FieldControllerProps) {
  const fieldContext = useFieldContext()
  const field = useField({ form: fieldContext.form, name: fieldContext.name })

  return (
    <Slot
      {...({
        id: field.name.toString(),
        name: field.name.toString(),
        value: field.state.value ?? '',
        onChange: handleChangeExtended(field),
        onBlur: field.handleBlur,
      })}
      {...props}
    >
      {children}
    </Slot>
  )
}

function handleChangeExtended(field: AnyFieldApi) {
  return (value: any) => {
    // TODO: this can be better
    const isOptional = field.form.options.defaultValues[field.name] === undefined

    let valueFromInput: any = undefined
    if (isInputChangeEvent(value)) {
      const inputMode = value.target.inputMode as ComponentProps<'input'>['inputMode']
      const inputType = value.target.type as ComponentProps<'input'>['type']
      const inputValue = (() => {
        switch (inputType) {
          case 'number':
          case 'range':
            return value.target.valueAsNumber

          case 'date':
          case 'time':
            return value.target.valueAsDate

          case 'checkbox':
          case 'radio':
            return value.target.checked

          case 'file':
            return value.target.files

          default:
            if (inputMode === 'numeric' || inputMode === 'decimal') {
              return value.target.valueAsNumber
            }

            return value.target.value
        }
      })()

      valueFromInput = inputValue
    }

    const finalValue = valueFromInput ?? value
    const isEmpty = finalValue?.toString().length === 0

    field.handleChange(isOptional && isEmpty ? undefined : finalValue)
  }
}

function isChangeEvent(value: any): value is ChangeEvent<any> {
  return (
    value?.target !== undefined &&
    value.target?.value !== undefined
  )
}

function isInputChangeEvent(value: any): value is ChangeEvent<HTMLInputElement> {
  if (!isChangeEvent(value)) return false

  const target = value.target

  return (
    target instanceof HTMLInputElement &&
    target.tagName === 'INPUT' &&
    typeof target.type === 'string' &&
    typeof target.value === 'string'
  )
}

export { useForm }
