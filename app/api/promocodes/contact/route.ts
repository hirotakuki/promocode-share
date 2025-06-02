import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: NextRequest) {
  // POSTメソッド以外は許可しない
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Method Not Allowed' }, { status: 405 });
  }

  try {
    // リクエストボディからname, email, messageを取得
    const { name, email, message } = await req.json();

    // 必須フィールドのチェック
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Nodemailerのトランスポーターを設定
    // Gmailサービスを使用し、環境変数から認証情報を取得
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL_ADDRESS, // Gmailのメールアドレス (環境変数)
        pass: process.env.GMAIL_APP_PASSWORD, // Gmailのアプリパスワード (環境変数)
      },
      // Gmail側のセキュリティ設定によっては、以下の設定が必要な場合があります。
      // 本番環境では 'rejectUnauthorized: false' は推奨されません。
      // tls: {
      //   rejectUnauthorized: false
      // }
    });

    // 送信するメールのオプションを設定
    const mailOptions = {
      // 送信元表示名と実際の送信元Gmailアドレス
      // テンプレートリテラル内の構文エラーを修正
      from: `"${name}" <${process.env.GMAIL_EMAIL_ADDRESS}>`,
      // 管理者のGmailアドレス（メールを受け取りたいアドレス）
      to: process.env.GMAIL_EMAIL_ADDRESS,
      // ユーザーが返信できるように、フォーム入力されたメールアドレスを設定
      replyTo: email,
      // メールの件名
      subject: `【Promocode Share】お問い合わせ: ${name}様より`,
      // テキスト形式のメール本文
      // テンプレートリテラル内の構文エラーを修正
      text: `以下の内容でお問い合わせがありました。\n\nお名前: ${name}\nメールアドレス: ${email}\n\nメッセージ:\n${message}`,
      // HTML形式のメール本文
      // テンプレートリテラル内の構文エラーを修正
      html: `
        <h2>お問い合わせ内容</h2>
        <p><strong>お名前:</strong> ${name}</p>
        <p><strong>メールアドレス:</strong> <a href="mailto:${email}">${email}</a></p>
        <p><strong>メッセージ:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // メールを送信
    await transporter.sendMail(mailOptions);

    // 成功レスポンス
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    // エラーハンドリングとログ出力
    console.error('Error sending email:', error);
    // エラーオブジェクトの内容をもう少し詳細に返すことも検討
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ message: `Failed to send email: ${errorMessage}` }, { status: 500 });
  }
}
