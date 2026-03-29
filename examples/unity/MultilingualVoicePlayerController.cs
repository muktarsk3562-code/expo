using System;
using System.Collections.Generic;
using UnityEngine;
#if UNITY_STANDALONE || UNITY_EDITOR_WIN
using UnityEngine.Windows.Speech;
#endif

/// <summary>
/// Mobile-friendly player movement + optional keyword voice commands.
/// Designed as an upgraded version of a basic WASD/space controller.
/// </summary>
[RequireComponent(typeof(Rigidbody))]
public class MultilingualVoicePlayerController : MonoBehaviour
{
    [Header("Movement")]
    public float moveSpeed = 6f;
    public float jumpForce = 6f;
    public float rotationSpeed = 10f;

    [Header("Ground Check")]
    public Transform groundCheck;
    public float groundRadius = 0.2f;
    public LayerMask groundMask;

    [Header("Mobile Input")]
    public bool useOnScreenInput = true;
    [Range(-1f, 1f)] public float inputX;
    [Range(-1f, 1f)] public float inputZ;
    public bool jumpPressed;

    [Header("Voice Command")]
    public bool enableVoiceCommands = true;

    private Rigidbody rb;
    private bool isGrounded;

#if UNITY_STANDALONE || UNITY_EDITOR_WIN
    private KeywordRecognizer keywordRecognizer;
#endif
    private readonly Dictionary<string, Action> commandMap = new Dictionary<string, Action>(StringComparer.OrdinalIgnoreCase);

    private void Awake()
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;
    }

    private void Start()
    {
        BuildCommandMap();
        StartVoiceRecognizer();
    }

    private void Update()
    {
        isGrounded = groundCheck != null && Physics.CheckSphere(groundCheck.position, groundRadius, groundMask);

        float moveX = useOnScreenInput ? inputX : Input.GetAxis("Horizontal");
        float moveZ = useOnScreenInput ? inputZ : Input.GetAxis("Vertical");

        Vector3 move = new Vector3(moveX, 0f, moveZ);
        Move(move);

        bool jumpInput = jumpPressed || Input.GetKeyDown(KeyCode.Space);
        if (jumpInput && isGrounded)
        {
            Jump();
        }

        // Reset one-shot UI button flag after consuming.
        jumpPressed = false;
    }

    private void Move(Vector3 move)
    {
        if (move.sqrMagnitude > 0.001f)
        {
            Vector3 normalized = move.normalized;
            Vector3 worldMove = transform.TransformDirection(normalized) * moveSpeed * Time.deltaTime;
            transform.position += worldMove;

            Quaternion targetRotation = Quaternion.LookRotation(normalized, Vector3.up);
            transform.rotation = Quaternion.Slerp(transform.rotation, targetRotation, rotationSpeed * Time.deltaTime);
        }
    }

    private void Jump()
    {
        rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);
    }

    /// <summary>
    /// Hook this from UI button events.
    /// </summary>
    public void SetMoveInput(Vector2 input)
    {
        inputX = Mathf.Clamp(input.x, -1f, 1f);
        inputZ = Mathf.Clamp(input.y, -1f, 1f);
    }

    /// <summary>
    /// Hook this from UI jump button OnClick/OnPointerDown.
    /// </summary>
    public void PressJump()
    {
        jumpPressed = true;
    }

    private void BuildCommandMap()
    {
        // English
        commandMap["forward"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["back"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["left"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["right"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["stop"] = () => SetMoveInput(Vector2.zero);
        commandMap["jump"] = PressJump;

        // Hindi (Devanagari + common transliteration)
        commandMap["आगे"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["पीछे"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["बाएं"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["दाएं"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["रुको"] = () => SetMoveInput(Vector2.zero);
        commandMap["कूदो"] = PressJump;
        commandMap["aage"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["peeche"] = () => SetMoveInput(new Vector2(0f, -1f));

        // Bengali
        commandMap["সামনে"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["পেছনে"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["বামে"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["ডানে"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["থামো"] = () => SetMoveInput(Vector2.zero);
        commandMap["লাফ"] = PressJump;

        // Tamil
        commandMap["முன்னே"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["பின்னே"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["இடது"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["வலது"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["நிறுத்து"] = () => SetMoveInput(Vector2.zero);
        commandMap["குதி"] = PressJump;

        // Telugu
        commandMap["ముందుకు"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["వెనుకకు"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["ఎడమ"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["కుడి"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["ఆపు"] = () => SetMoveInput(Vector2.zero);
        commandMap["జంప్"] = PressJump;

        // Malayalam
        commandMap["മുന്നോട്ട്"] = () => SetMoveInput(new Vector2(0f, 1f));
        commandMap["പിന്നോട്ട്"] = () => SetMoveInput(new Vector2(0f, -1f));
        commandMap["ഇടത്"] = () => SetMoveInput(new Vector2(-1f, 0f));
        commandMap["വലത്"] = () => SetMoveInput(new Vector2(1f, 0f));
        commandMap["നിർത്തു"] = () => SetMoveInput(Vector2.zero);
        commandMap["ചാടി"] = PressJump;
    }

    private void StartVoiceRecognizer()
    {
        if (!enableVoiceCommands)
        {
            return;
        }

#if UNITY_STANDALONE || UNITY_EDITOR_WIN
        keywordRecognizer = new KeywordRecognizer(new List<string>(commandMap.Keys).ToArray());
        keywordRecognizer.OnPhraseRecognized += args =>
        {
            if (commandMap.TryGetValue(args.text, out Action action))
            {
                action?.Invoke();
            }
        };
        keywordRecognizer.Start();
#else
        Debug.Log("Voice keywords require a platform-specific speech plugin for Android/iOS.");
#endif
    }

    private void OnDestroy()
    {
#if UNITY_STANDALONE || UNITY_EDITOR_WIN
        if (keywordRecognizer != null)
        {
            if (keywordRecognizer.IsRunning)
            {
                keywordRecognizer.Stop();
            }
            keywordRecognizer.Dispose();
        }
#endif
    }
}
