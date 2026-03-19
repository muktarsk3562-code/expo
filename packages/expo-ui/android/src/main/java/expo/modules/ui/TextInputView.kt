package expo.modules.ui

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import expo.modules.kotlin.views.ComposeProps
import expo.modules.kotlin.views.AsyncFunctionHandlerScope
import expo.modules.kotlin.views.FunctionalComposableScope

data class TextInputProps(
  val defaultValue: String = "",
  val placeholder: String = "",
  val variant: String = "filled",
  val multiline: Boolean = false,
  val numberOfLines: Int? = null,
  val keyboardType: String = "default",
  val autocorrection: Boolean = true,
  val autoCapitalize: String = "none",
  val modifiers: ModifierList = emptyList()
) : ComposeProps

private fun String.keyboardType(): KeyboardType {
  return when (this) {
    "default" -> KeyboardType.Text
    "numeric" -> KeyboardType.Number
    "email-address" -> KeyboardType.Email
    "phone-pad" -> KeyboardType.Phone
    "decimal-pad" -> KeyboardType.Decimal
    "password" -> KeyboardType.Password
    "ascii-capable" -> KeyboardType.Ascii
    "url" -> KeyboardType.Uri
    "number-password" -> KeyboardType.NumberPassword
    else -> KeyboardType.Text
  }
}

private fun String.autoCapitalize(): KeyboardCapitalization {
  return when (this) {
    "characters" -> KeyboardCapitalization.Characters
    "none" -> KeyboardCapitalization.None
    "sentences" -> KeyboardCapitalization.Sentences
    "unspecified" -> KeyboardCapitalization.Unspecified
    "words" -> KeyboardCapitalization.Words
    else -> KeyboardCapitalization.None
  }
}

@Composable
fun FunctionalComposableScope.TextInputContent(
  props: TextInputProps,
  onSetText: AsyncFunctionHandlerScope<String>,
  onValueChanged: (String) -> Unit
) {
  val textState = remember { mutableStateOf<String?>(null) }

  onSetText { text ->
    textState.value = text
    onValueChanged(text)
  }

  val value = textState.value ?: props.defaultValue
  val onValueChange: (String) -> Unit = {
    textState.value = it
    onValueChanged(it)
  }
  val placeholder: @Composable () -> Unit = { Text(props.placeholder) }
  val maxLines = if (props.multiline) props.numberOfLines ?: Int.MAX_VALUE else 1
  val singleLine = !props.multiline
  val keyboardOptions = KeyboardOptions.Default.copy(
    keyboardType = props.keyboardType.keyboardType(),
    autoCorrectEnabled = props.autocorrection,
    capitalization = props.autoCapitalize.autoCapitalize()
  )
  val modifier = ModifierRegistry.applyModifiers(props.modifiers, appContext, composableScope, globalEventDispatcher)

  if (props.variant == "outlined") {
    OutlinedTextField(
      value = value,
      onValueChange = onValueChange,
      placeholder = placeholder,
      maxLines = maxLines,
      singleLine = singleLine,
      keyboardOptions = keyboardOptions,
      modifier = modifier
    )
  } else {
    TextField(
      value = value,
      onValueChange = onValueChange,
      placeholder = placeholder,
      maxLines = maxLines,
      singleLine = singleLine,
      keyboardOptions = keyboardOptions,
      modifier = modifier
    )
  }
}
