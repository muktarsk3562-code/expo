# High-Quality Mobile 3D Controller (Android + iOS)

This example upgrades a basic `PlayerMovement` script for a GTA-style open-world prototype with:

- Rigidbody jump + ground check
- Mobile on-screen movement input hooks
- Voice command mapping for:
  - Bengali
  - Hindi
  - Tamil
  - Telugu
  - Malayalam
  - English fallback

## File

- `MultilingualVoicePlayerController.cs`

## Unity setup

1. Add script to your Player GameObject.
2. Assign `groundCheck` Transform near the player's feet.
3. Set `groundMask` to your ground layer.
4. For touch UI:
   - Call `SetMoveInput(Vector2 input)` from joystick drag events.
   - Call `PressJump()` from jump button.
5. For voice:
   - Windows editor/standalone works with built-in `KeywordRecognizer`.
   - Android/iOS requires a speech-to-text plugin; once recognized text is available, feed it through `commandMap` style logic.

## Notes for production quality

- Add Cinemachine camera rig.
- Use animation blend trees for walk/run/jump states.
- Add object pooling, LOD, baked lighting, and texture compression profiles per platform.
- Use Addressables for streaming high-quality assets.
