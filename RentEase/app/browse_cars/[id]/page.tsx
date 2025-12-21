import Link from "next/link";
import { notFound } from "next/navigation"; // 1. Uvozimo notFound funkciju

// Server-side fetching
async function getCarDetails(id: string) {
  // 2. Dodajemo log da vidiš u terminalu koji ID stvara problem
  console.log("Dohvaćam podatke za ID:", id); 

  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  
  // 3. Ako API vrati 404 (ili bilo što što nije OK), vraćamo null umjesto greške
  if (!res.ok) {
    return null;
  }
  
  return res.json();
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // U Next.js 15+ i 16, params je Promise i mora se awaitati
  const { id } = await params;
  
  const car = await getCarDetails(id);

  // 4. Ako auto nije pronađen (null), aktiviraj Next.js 404 stranicu
  if (!car) {
    notFound();
  }

  return (
    <div className="container mx-auto p-10 max-w-3xl">
      <Link href="/browse_cars" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to Browse
      </Link>
      
      <div className="bg-white border p-8 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl font-bold">Car Model #{car.id}</h1>
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded">Available</span>
        </div>
        
        <h3 className="text-xl font-semibold text-gray-800 mb-4">{car.title}</h3>
        <p className="text-gray-600 leading-relaxed mb-8">
          {car.body}
        </p>
        
        <div className="border-t pt-6 flex justify-between items-center">
            <div className="text-2xl font-bold">$50 <span className="text-sm font-normal text-gray-500">/ day</span></div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded hover:bg-blue-700 transition">
                Book This Car
            </button>
        </div>
      </div>
    </div>
  );
}