import Link from "next/link";

// 1. Konstanta: Koliko auta želimo po stranici
const ITEMS_PER_PAGE = 6;

async function getCars() {
  // Dohvaćamo SVE aute (postove) odjednom
  const res = await fetch('https://jsonplaceholder.typicode.com/posts');
  if (!res.ok) throw new Error('Failed to fetch data');
  return res.json();
}

// 2. Definiramo tipove za props (Next.js nam šalje searchParams)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BrowseCarsPage(props: Props) {
  // 3. Čekamo parametre i dohvaćamo trenutnu stranicu (ako nema, onda je 1)
  const searchParams = await props.searchParams;
  const currentPage = Number(searchParams.page) || 1;

  const allCars = await getCars();

  // 4. Matematika za paginaciju
  const totalCars = allCars.length;
  const totalPages = Math.ceil(totalCars / ITEMS_PER_PAGE);

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  
  // Uzimamo samo onih 6 auta koji pripadaju trenutnoj stranici
  const currentCars = allCars.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Available Cars</h1>
        <span className="text-gray-500">
            Page {currentPage} of {totalPages}
        </span>
      </div>
      
      {/* GRID S AUTOMOBILIMA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {currentCars.map((car: any) => (
          <div key={car.id} className="bg-white border p-4 rounded-lg shadow hover:shadow-md transition flex flex-col justify-between h-full">
            <div>
               {/* Simuliramo sliku auta */}
              <div className="bg-gray-200 h-40 mb-4 rounded flex items-center justify-center text-gray-400">
                Car Image
              </div>
              <h2 className="font-bold text-xl mb-2 text-gray-800">Car Model #{car.id}</h2>
              <p className="text-gray-600 line-clamp-2 text-sm">{car.title}</p>
            </div>
            
            <Link href={`/browse_cars/${car.id}`} className="mt-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700 transition">
                View Details
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* NAVIGACIJA ZA PAGINACIJU (DOLE) */}
      <div className="mt-12 flex justify-center items-center gap-4">
        
        {/* Gumb Previous: Prikazujemo ga samo ako nismo na prvoj stranici */}
        {currentPage > 1 ? (
            <Link href={`/browse_cars?page=${currentPage - 1}`}>
                <button className="px-4 py-2 border rounded bg-white hover:bg-gray-100 text-gray-700">
                    &larr; Previous
                </button>
            </Link>
        ) : (
            <button disabled className="px-4 py-2 border rounded bg-gray-100 text-gray-400 cursor-not-allowed">
                &larr; Previous
            </button>
        )}

        {/* Prikaz brojeva stranica */}
        <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{currentPage}</span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">{totalPages}</span>
        </div>

        {/* Gumb Next: Prikazujemo ga samo ako nismo na zadnjoj stranici */}
        {currentPage < totalPages ? (
            <Link href={`/browse_cars?page=${currentPage + 1}`}>
                <button className="px-4 py-2 border rounded bg-white hover:bg-gray-100 text-gray-700">
                    Next &rarr;
                </button>
            </Link>
        ) : (
            <button disabled className="px-4 py-2 border rounded bg-gray-100 text-gray-400 cursor-not-allowed">
                Next &rarr;
            </button>
        )}
      </div>
    </div>
  );
}