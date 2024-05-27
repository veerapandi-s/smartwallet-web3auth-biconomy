import 'bootstrap/dist/css/bootstrap.css';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Web3Auth x Biconomy",
  description: "Account Abstraction Test",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
