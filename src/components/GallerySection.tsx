import React, { useState } from 'react';
import { Sparkles, ChevronDown } from 'lucide-react';
import JadeMuseumCanvas from './3d/JadeMuseumCanvas'; // 注意：需要先创建该文件

// 内部数据
const items = [
  {
    title: '山水牌',
    subtitle: 'Shan Shui Pendant',
    desc: '四会工的巅峰代表。利用翡翠天然的色带，雕刻出高山流水、亭台楼阁。意境深远，寓意‘仁者乐山，智者乐水’。',
    img: '/gallery-1-sihui.jpg',
  },
  {
    title: '平安扣',
    subtitle: 'Safety Buckle',
    desc: '大道至简。内外皆圆，寓意圆满平安。对料子要求极高，通常选用种水通透的翡翠，最能体现玉质本身的美。',
    img: '/gallery-2-sihui.jpg',
  },
  {
    title: '金玉满堂',
    subtitle: 'Jadeite Fortune Pod',
    desc: '以冰种翡翠雕成的造型，翠色清润，金质边框錾刻缠枝纹，嵌两粒红珠，流苏垂坠，尽显雅致。佩戴时，温润翡翠贴合肌肤，金饰流苏随步摇曳，既显传统吉祥意趣，又添灵动贵气。',
    img: '/gallery-3-sihui.jpg',
  },
  {
    title: '太平有象',
    subtitle: 'Peaceful Elephant',
    desc: '一只憨态可掬的大象身驮华丽的毯垫，一童子淘气地伏在其背上，另一童子手托宝瓶立于象旁，宝瓶内满装满圣水，瓶乘一支梅花及于象背。以此洁白纯净、温润细腻的白玉雕琢而成的吉祥造型乃是“太平有象”。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '好运莲莲',
    subtitle: 'Jade Lotus Serenity',
    desc: '这款“好运莲莲”和田玉手链，以温润和田玉搭配精巧莲花银饰，碎银链身波光闪烁，尽显清冷高级感。寓意“碎碎平安”与福运绵延，日常佩戴衬出诗书气韵，自戴送礼皆宜，是兼具美感与吉祥意蕴的心动之选。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '岫玉',
    subtitle: 'Shouxiu Jade',
    desc: '这款天然岫玉双鱼玉佩，甄选优质岫玉原料雕琢而成，玉质莹润通透，质地细腻温润。采用镂空雕刻工艺打造出灵动的双鱼造型，线条流畅自然，双鱼相绕的设计寓意着年年有余、成双成对，是颇具韵味的日常佩戴饰品。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠心摇光',
    subtitle: 'Jade Heart Gleam',
    desc: '胸针以“翠色植物+双心流苏”为核心，翡翠雕琢成细密叶簇，银镶钻勾勒灵动枝干，末端垂坠一翠一灰双心吊坠——翡翠叶象征「生机绵延、福泽扎根」，双心流苏暗喻「心意相通、好运流转」，银镶钻则添璀璨锋芒，让古典雅致与现代精致巧妙交融。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠莲禅韵观音',
    subtitle: 'Jade Lotus Guanyin of Zen',
    desc: '这尊翡翠观音以冰种飘花玉料雕就，结跏趺坐于莲台，右手持莲枝，莲花或含苞或盛放，翠色与莲纹相融；左手托如意，似净瓶玉露。身后紫檀背光镂雕缠枝莲与祥云，底座饰莲瓣纹。融“莲之清净”与“玉之温润”于一体，寓意观音慈光普照，消灾解厄、福泽绵长，是宗教信仰与艺术美学的双重承载。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠玉衔钱金蟾',
    subtitle: 'Jade Money - holding Toad',
    desc: '此玉雕金蟾以淡青色玉石为材，质地温润细腻，雕工生动传神：金蟾昂首鼓目，鳞甲纹理清晰可辨，口衔铜钱，三足稳立于雕花底座之上。在中国传统文化中，金蟾本为招财祥瑞之物，“衔钱” 更添 “聚财纳福、财源广进” 之寓意。玉石温润与金蟾灵动感相融，既显传统工艺之美，又承载着对财富积攒与生活富足的美好祈愿，是装饰与吉祥寓意兼具的艺术佳品。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '玉白菜',
    subtitle: 'Jade Cabbage',
    desc: '玉白菜自古有“遇百财”的吉祥寓意，象征招财聚宝、百事顺遂。置于玄关或书房，既显玉石的雅致气韵，又添一份对生活的美好期许，是传统吉祥文化与工艺美学的融合。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '冰韵佛颜',
    subtitle: 'IceBud',
    desc: '冰透翡翠雕琢慈祥佛公，眉眼含笑，肚腹圆润，寓意“肚里能容天下事”。镶钻边框如月光轻拥，更显通透灵韵，佩戴间自有一份平和与福气萦绕。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠凝珠华',
    subtitle: 'Emerald Aura Strand',
    desc: '精选满绿翡翠圆珠串连而成，色泽如春水映翠，通透莹润。多层设计叠戴间流光婉转，既显古典雅韵，又添现代华贵，是彰显品味的点睛之笔。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠玉灵犬',
    subtitle: 'Jadeite Lucky Pups',
    desc: '以翡翠雕琢而成的萌犬，毛色纹理自然天成，红绳流苏点缀更添喜气。双犬并立，寓意“犬守安康”，既是雅致摆件，又承载守护家宅、带来好运的美好祝福。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '翠钻流光戒',
    subtitle: 'Diamond Radiance Ring',
    desc: '戒指以饱满蛋面翡翠为主石，翠色浓郁通透，周围群镶钻石如星芒环绕，钻石的璀璨与翡翠的温润相得益彰。精湛的镶嵌工艺让两种宝石完美融合，光影流转间尽显奢华雅致，既是彰显品味的时尚单品，也承载着富贵吉祥的美好寓意。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '沉香翠缘手链',
    subtitle: 'Agarwood Jade Encounter Bracelet',
    desc: '精选沉香木圆珠与翡翠椭圆珠错落串联，沉香木质朴沉稳，翡翠莹润清透，二者刚柔并济，碰撞出独特的东方韵味。佩戴间，沉香淡雅香气若隐若现，翡翠灵动翠色点缀腕间，既是修身养性的雅物，也是承载美好寓意的幸运配饰。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '紫翠凝香项链',
    subtitle: 'Jadeite Elegance Necklace',
    desc: '以柔美紫玉石珠串为基底，缀以多颗饱满翡翠蛋面，辅以群镶钻饰点缀。紫玉的淡雅与翡翠的鲜翠交相辉映，Y字型设计垂坠间尽显灵动，既融合了东方玉石的温润底蕴，又兼具西式珠宝的华丽工艺，是彰显贵气与品味的点睛之笔。',
    img: '/gallery-4-sihui.jpg',
  },
  {
    title: '蝴蝶胸针',
    subtitle: 'Butterfly brooch',
    desc: '以蝴蝶为形，翡翠雕琢翅脉，钻石铺陈光华，金银交织勾勒优雅轮廓。轻别于襟前，似有蝴蝶翩然停驻，翡翠的温润与钻石的璀璨相映成趣。寓意“福蝶临门”的吉祥祝愿，更添一份灵动优雅气质，传统工艺与现代审美的诗意碰撞。',
    img: '/gallery-4-sihui.jpg',
  },
];

const modelUrls = [
  '/model_3d/08ccaf76312cbc815831e60a8b0c1af4.glb',
  '/model_3d/d2e3b1f4e3b568d6ffefbca2e564d589.glb',
  '/model_3d/de1fbb62c4dc57bf66b28ccd6571475c.glb',
  '/model_3d/4d706557521a51bab8e97da7490b602b.glb',
  '/model_3d/5ec0d02bfe9bcf581949f0740d98e372.glb',
  '/model_3d/ebdfe1d330c2f27f8d174852f8899440.glb',
  '/model_3d/6f227dbd00c89677b445731483e90dfe.glb',
  '/model_3d/7bb8e2c98702b5cbaa3a859aeedad76f.glb',
  '/model_3d/ddccfe945eab0eedad3def530f914ee0.glb',
  '/model_3d/210d0f8cfea9133b7f97c4d8133ded74.glb',
  '/model_3d/0854d1f26a16cc9467e6847d9cc72854.glb',
  '/model_3d/27596c0504b4c6959251bb3d3368672b.glb',
  '/model_3d/606118c72387058cb44486dacfccbd93.glb',
  '/model_3d/a616abfe3213b9bf92170e450b8b33a8.glb',
  '/model_3d/b0e98986fb5d1acb1b2ead5c74786048 (1).glb',
  '/model_3d/c95b54237a5ad53492e3588b7ce4d5f6.glb',
  '/model_3d/蝴蝶胸针.glb',
];

interface GallerySectionProps {
  onOpenMuseum?: () => void;
}

const GallerySection: React.FC<GallerySectionProps> = ({ onOpenMuseum }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = items[activeIndex];
  const currentModel = modelUrls[activeIndex % modelUrls.length];

  const handlePrev = () =>
    setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % items.length);

  return (
    <section id="gallery" className="py-12 md:py-24 bg-[#0a1813] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold mb-4 serif">名玉赏析</h2>
          <div className="w-12 md:w-16 h-1 bg-[#d4af37] mx-auto mb-4 md:mb-6"></div>
          <p className="text-gray-400 text-sm md:text-base">3D 模型博物馆展示，旋转/缩放近距离看料性</p>
          <div className="mt-4 md:mt-6 flex justify-center">
            <button
              onClick={onOpenMuseum}
              className="px-4 py-2 md:px-6 md:py-3 rounded-full border border-[#d4af37] text-[#d4af37] text-sm md:text-base hover:bg-[#d4af37] hover:text-[#112A23] transition"
            >
              进入 AI 博物馆
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[1.15fr_0.9fr] gap-6 md:gap-10 items-center">
          {/* 3D 画布区域 - 移动端优先高度自适应 */}
          <div className="w-full order-1 lg:order-none">
            <div className="h-[280px] sm:h-[380px] md:h-[460px] lg:h-[560px] shadow-2xl rounded-2xl md:rounded-3xl relative border border-white/10 bg-gradient-to-b from-[#0d1f18] to-[#050805]/90 overflow-hidden">
              <JadeMuseumCanvas
                key={current.img + currentModel}
                imageUrl={current.img}
                modelUrl={currentModel}
              />
              <div className="absolute top-3 left-3 md:top-4 md:left-4 px-2 py-1 md:px-4 md:py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full text-[10px] md:text-xs tracking-[0.2em] md:tracking-[0.25em] uppercase">
                Particle Jade
              </div>
              <div className="absolute bottom-3 right-3 md:bottom-4 md:right-4 flex items-center gap-1 md:gap-2 text-emerald-100/80 text-[10px] md:text-xs bg-black/50 px-2 py-1 md:px-3 md:py-2 rounded-full border border-white/10">
                <Sparkles size={12} className="text-[#d4af37]" />
                <span>拖动画布旋转/缩放</span>
              </div>
            </div>
          </div>

          {/* 右侧内容区域 */}
          <div className="space-y-4 md:space-y-6 w-full order-2">
            {/* 按钮列表 - 移动端横向滚动 */}
            <div className="relative">
              <div className="flex flex-nowrap lg:flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                {items.map((item, idx) => (
                  <button
                    key={item.title}
                    onClick={() => setActiveIndex(idx)}
                    className={`flex-shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-xs md:text-sm transition-all whitespace-nowrap ${
                      idx === activeIndex
                        ? 'bg-[#d4af37] text-[#112A23] border-[#d4af37]'
                        : 'border-white/20 text-white/80 hover:border-[#d4af37]/60 hover:text-white'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              {/* 移动端滚动提示（可选） */}
              <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#0a1813] to-transparent pointer-events-none" />
            </div>

            {/* 描述卡片 */}
            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] text-[#d4af37] mb-2">
                {current.subtitle}
              </p>
              <h3 className="text-xl md:text-3xl font-bold serif mb-2 md:mb-3">{current.title}</h3>
              <p className="text-sm md:text-base text-gray-200/90 leading-relaxed line-clamp-4 md:line-clamp-none">
                {current.desc}
              </p>
            </div>

            {/* 导航控制 */}
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={handlePrev}
                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/15 hover:border-[#d4af37] hover:text-[#d4af37] transition-all bg-white/5"
              >
                <ChevronDown size={16} className="rotate-90 md:w-5 md:h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-8 h-8 md:w-12 md:h-12 flex items-center justify-center rounded-full border border-white/15 hover:border-[#d4af37] hover:text-[#d4af37] transition-all bg-white/5"
              >
                <ChevronDown size={16} className="-rotate-90 md:w-5 md:h-5" />
              </button>
              <div className="flex-1 h-[1px] bg-white/10" />
              <div className="flex gap-1 md:gap-2">
                {items.map((_, idx) => (
                  <span
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx === activeIndex ? 'w-6 md:w-8 bg-[#d4af37]' : 'w-1.5 md:w-2 bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


export default GallerySection;