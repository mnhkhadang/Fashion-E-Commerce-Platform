export default function Banner(){
    return (
        <section
            className="relative overflow-hidden bg-gradient-to-br from-red-700 via-red-600 to-orange-500 text-white text-center py-10 px-4"
            aria-label="Khuyến mãi hôm nay"
        >
            <div className="absolute -top-14 -left-14 w-52 h-52 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"/>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"/>
            <div className="absolute top-3 right-1/4 w-20 h-20 rounded-full bg-white/5 pointer-events-none" aria-hidden="true"/>
            <div className="relative z-10">
                <span className="inline-block bg-white/20 border border-white/30 rounded-full px-4 py-1 text-[11px] font-bold tracking-widest uppercase mb-3 select-none">
                    ⏰ Hôm nay duy nhất
                </span>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2 leading-tight">
                    🔥 Siêu Sale Hôm Nay
                </h1>
                <p className="text-[15px] text-white/90">
                    Giảm đến <strong className="font-bold">50%</strong> cho hàng ngàn sản phẩm. Số lượng có hạn!
                </p>
            </div>
        </section>
    )
}