import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "./_components/navigation";
// 1. IMPORTAJ FOOTER
import Footer from "./_components/Footer"; 
import { RentalProvider } from "./_context/RentalContext"; 
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "RentEase",
  description: "Car rental application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <RentalProvider>
          {/* 2. Dodaj 'flex flex-col' da se footer lijepo ponaša */}
          <div className="min-h-screen bg-white flex flex-col">
            <Navigation />
            
            {/* 3. Dodaj 'flex-grow' da main gura footer na dno */}
            <main className="flex-grow">
              {children}
              <Toaster position="top-center" richColors />
            </main>

            {/* 4. OVDJE UBACI FOOTER KOMPONENTU */}
            <Footer />
          </div>
        </RentalProvider>
      </body>
    </html>
  );
}