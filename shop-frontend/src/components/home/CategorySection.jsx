import { useNavigate } from "react-router-dom"

function CategoryPill({ label, active, onClick}){
    return (
        <button
            onClick={onClick}
            aria-pressed={active}
            className={[
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-150 cursor-pointer',
                active
                    ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white border-transparent shadow-md shadow-orange-200'
                    : 'bg-white border border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500'
            ].join(' ')}
            > {label}
        </button>
    )
}


export default function CategorySection({ categories, selectedCategory}){
    const navigate = useNavigate()
    return (
        <nav className="bg-white rounded-lg px-5 py-4 mb-5 shadow-sm" aria-label="Lọc theo danh mục">
            <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mb-3">Danh mục</p>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0">
                <li>
                    <CategoryPill label="Tất cả" active={!selectedCategory} onClick={() => navigate(`/`)} />                
                </li>
                {categories.map(cat =>(
                    <li key={cat.id}>
                        <CategoryPill 
                            label={cat.name}
                            active={selectedCategory == cat.name}
                            onClick={() => navigate(`/category/${encodeURIComponent(cat.name)}`) }
                        />
                    </li>
                ))}
            </ul>
        </nav>
    )
}