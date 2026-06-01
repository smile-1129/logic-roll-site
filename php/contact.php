<?php
/**
 * LOGIC ROLL — お問い合わせメール送信
 * 1. 管理者へ通知 (dojinworks.2525@gmail.com)
 * 2. 送信者へサンクスメール（送信内容の控え付き）
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

const ADMIN_EMAIL = 'dojinworks.2525@gmail.com';
const FROM_EMAIL  = 'dojinworks.2525@gmail.com';
const SITE_NAME   = 'LOGIC ROLL';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method not allowed'], JSON_UNESCAPED_UNICODE);
    exit;
}

mb_language('Japanese');
mb_internal_encoding('UTF-8');

function respond(bool $ok, string $message, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['ok' => $ok, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitize(string $value, int $maxLen): string
{
    $value = trim($value);
    $value = str_replace(["\0", "\r"], '', $value);
    if (mb_strlen($value) > $maxLen) {
        $value = mb_substr($value, 0, $maxLen);
    }
    return $value;
}

$name    = sanitize((string)($_POST['name'] ?? ''), 80);
$email   = sanitize((string)($_POST['email'] ?? ''), 254);
$subject = sanitize((string)($_POST['subject'] ?? ''), 120);
$message = sanitize((string)($_POST['message'] ?? ''), 3000);

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    respond(false, '必須項目をすべて入力してください。', 400);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'メールアドレスの形式が正しくありません。', 400);
}

$submittedAt = date('Y-m-d H:i:s');

$adminSubject = '【' . SITE_NAME . '】お問い合わせ: ' . $subject;
$adminBody = <<<TEXT
LOGIC ROLL 公式サイトよりお問い合わせがありました。

━━━━━━━━━━━━━━━━━━━━
■ 送信日時
{$submittedAt}

■ お名前
{$name}

■ メールアドレス
{$email}

■ 件名
{$subject}

■ お問い合わせ内容
{$message}
━━━━━━━━━━━━━━━━━━━━
TEXT;

$thanksSubject = '【' . SITE_NAME . '】お問い合わせありがとうございます';
$thanksBody = <<<TEXT
{$name} 様

この度は LOGIC ROLL へお問い合わせいただき、誠にありがとうございます。
以下の内容で承りました。担当より折り返しご連絡いたしますので、今しばらくお待ちください。

━━━━━━━━━━━━━━━━━━━━
■ 件名
{$subject}

■ お問い合わせ内容
{$message}
━━━━━━━━━━━━━━━━━━━━

※ 本メールは自動送信です。このメールに返信いただいても構いません。

────────────────────
LOGIC ROLL Project
https://
────────────────────
TEXT;

$commonHeaders = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . mb_encode_mimeheader(SITE_NAME, 'UTF-8') . ' <' . FROM_EMAIL . '>',
]);

$adminHeaders = $commonHeaders . "\r\n" .
    'Reply-To: ' . $name . ' <' . $email . '>';

$thanksHeaders = $commonHeaders . "\r\n" .
    'Reply-To: ' . FROM_EMAIL;

$adminSent = mb_send_mail(ADMIN_EMAIL, $adminSubject, $adminBody, $adminHeaders);
$thanksSent = mb_send_mail($email, $thanksSubject, $thanksBody, $thanksHeaders);

if (!$adminSent) {
    respond(false, '管理者へのメール送信に失敗しました。サーバーのメール設定をご確認ください。', 500);
}

if (!$thanksSent) {
    respond(false, '自動返信メールの送信に失敗しました。お手数ですが再度お試しください。', 500);
}

respond(true, 'お問い合わせを送信しました。確認メールをお送りしましたのでご確認ください。');
