// C:\promocode-share\app\contact\page.tsx

import ContactForm from '../components/ContactForm'; // ContactForm.tsx の実際のパスに合わせて調整してください

export const metadata = {
  title: 'お問い合わせ | Promocode Share',
  description: 'Promocode Shareに関するご質問、ご意見、ご要望など、お気軽にお問い合わせください。',
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* h1タグの色を text-gray-900 (ほぼ黒) に変更 */}
      <h1 className="text-4xl font-extrabold text-center mb-10 text-gray-900">お問い合わせ</h1>
      {/* pタグの色を text-gray-700 (濃いグレー) に変更 */}
      <p className="text-lg text-center mb-8 text-gray-700">
        Promocode Shareに関するご質問、ご意見、ご要望など、お気軽にお問い合わせください。
      </p>
      <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
        <ContactForm />
      </div>
    </div>
  );
}
