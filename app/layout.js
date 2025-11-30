import './globals.css'

export const metadata = {
  title: 'Trade.xyz Volume Checker',
  description: 'Vérifiez le volume de trading sur Trade.xyz',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
