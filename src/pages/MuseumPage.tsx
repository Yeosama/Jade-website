import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import JadeMuseumCanvas from "../components/3d/JadeMuseumCanvas";

const museumArtifacts = [
  {
    title: "山水牌",
    subtitle: "Shan Shui Pendant",
    desc: "四会工的巅峰代表。利用翡翠天然的色带，雕刻出高山流水、亭台楼阁。意境深远，寓意‘仁者乐山，智者乐水’。",
    img: "/museum/山水牌.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/08ccaf76312cbc815831e60a8b0c1af4.glb",
  },
  {
    title: "平安扣",
    subtitle: "Safety Buckle",
    desc: "大道至简。内外皆圆，寓意圆满平安。对料子要求极高，通常选用种水通透的翡翠，最能体现玉质本身的美。",
    img: "/museum/平安扣.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/d2e3b1f4e3b568d6ffefbca2e564d589.glb",
  },
  {
    title: "金玉满堂",
    subtitle: "Jadeite Fortune Pod",
    desc: "以冰种翡翠雕成的造型，翠色清润，金质边框錾刻缠枝纹，嵌两粒红珠，流苏垂坠，尽显雅致。佩戴时，温润翡翠贴合肌肤，金饰流苏随步摇曳，既显传统吉祥意趣，又添灵动贵气。",
    img: "/museum/金玉满堂.jpg",
    imgPos: "center 10%",
    modelUrl: "/model_3d/de1fbb62c4dc57bf66b28ccd6571475c.glb",
  },
  {
    title: "太平有象",
    subtitle: "Peaceful Elephant",
    desc: "一只憨态可掬的大象身驮华丽的毯垫，一童子淘气地伏在其背上，另一童子手托宝瓶立于象旁，宝瓶内满装满圣水，瓶乘一支梅花及于象背。以此洁白纯净、温润细腻的白玉雕琢而成的吉祥造型乃是“太平有象”。",
    img: "/museum/太平有象.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/4d706557521a51bab8e97da7490b602b.glb",
  },
  {
    title: "好运莲莲",
    subtitle: "Jade Lotus Serenity",
    desc: "这款“好运莲莲”和田玉手链，以温润和田玉搭配精巧莲花银饰，碎银链身波光闪烁，尽显清冷高级感。寓意“碎碎平安”与福运绵延，日常佩戴衬出诗书气韵，自戴送礼皆宜，是兼具美感与吉祥意蕴的心动之选。",
    img: "/museum/好运莲莲.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/5ec0d02bfe9bcf581949f0740d98e372.glb",
  },
  {
    title: "岫玉",
    subtitle: "Shouxiu Jade",
    desc: "这款天然岫玉双鱼玉佩，甄选优质岫玉原料雕琢而成，玉质莹润通透，质地细腻温润。采用镂空雕刻工艺打造出灵动的双鱼造型，线条流畅自然，双鱼相绕的设计寓意着年年有余、成双成对，是颇具韵味的日常佩戴饰品。",
    img: "/museum/岫玉.jpg",
    imgPos: "center 30%",
    modelUrl: "/model_3d/ebdfe1d330c2f27f8d174852f8899440.glb",
  },
  {
    title: "翠心摇光",
    subtitle: "Jade Heart Gleam",
    desc: "胸针以“翠色植物+双心流苏”为核心，翡翠雕琢成细密叶簇，银镶钻勾勒灵动枝干，末端垂坠一翠一灰双心吊坠——翡翠叶象征「生机绵延、福泽扎根」，双心流苏暗喻「心意相通、好运流转」，银镶钻则添璀璨锋芒，让古典雅致与现代精致巧妙交融。",
    img: "/museum/翠心摇光.jpg",
    imgPos: "100% 50%",
    modelUrl: "/model_3d/6f227dbd00c89677b445731483e90dfe.glb",
  },
  {
    title: "翠莲禅韵观音",
    subtitle: "Jade Lotus Guanyin of Zen",
    desc: "这尊翡翠观音以冰种飘花玉料雕就，结跏趺坐于莲台，右手持莲枝，莲花或含苞或盛放，翠色与莲纹相融；左手托如意，似净瓶玉露。身后紫檀背光镂雕缠枝莲与祥云，底座饰莲瓣纹。融“莲之清净”与“玉之温润”于一体，寓意观音慈光普照，消灾解厄、福泽绵长，是宗教信仰与艺术美学的双重承载。",
    img: "/museum/翠莲禅韵观音.jpg",
    imgPos: "100% 50%",
    modelUrl: "/model_3d/7bb8e2c98702b5cbaa3a859aeedad76f.glb",
  },
  {
    title: "翠玉衔钱金蟾",
    subtitle: "Jade Money - holding Toad",
    desc: "此玉雕金蟾以淡青色玉石为材，质地温润细腻，雕工生动传神：金蟾昂首鼓目，鳞甲纹理清晰可辨，口衔铜钱，三足稳立于雕花底座之上。在中国传统文化中，金蟾本为招财祥瑞之物，“衔钱” 更添 “聚财纳福、财源广进” 之寓意。玉石温润与金蟾灵动感相融，既显传统工艺之美，又承载着对财富积攒与生活富足的美好祈愿，是装饰与吉祥寓意兼具的艺术佳品。",
    img: "/museum/翠玉衔钱金蟾.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/ddccfe945eab0eedad3def530f914ee0.glb",
  },
  {
    title: "玉白菜",
    subtitle: "Jade Cabbage",
    desc: "玉白菜自古有“遇百财”的吉祥寓意，象征招财聚宝、百事顺遂。置于玄关或书房，既显玉石的雅致气韵，又添一份对生活的美好期许，是传统吉祥文化与工艺美学的融合。",
    img: "/museum/玉白菜.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/210d0f8cfea9133b7f97c4d8133ded74.glb",
  },
  {
    title: "冰韵佛颜",
    subtitle: "IceBud",
    desc: "冰透翡翠雕琢慈祥佛公，眉眼含笑，肚腹圆润，寓意“肚里能容天下事”。镶钻边框如月光轻拥，更显通透灵韵，佩戴间自有一份平和与福气萦绕。",
    img: "/museum/冰韵佛颜.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/0854d1f26a16cc9467e6847d9cc72854.glb",
  },
  {
    title: "翠凝珠华",
    subtitle: "Emerald Aura Strand",
    desc: "精选满绿翡翠圆珠串连而成，色泽如春水映翠，通透莹润。多层设计叠戴间流光婉转，既显古典雅韵，又添现代华贵，是彰显品味的点睛之笔。",
    img: "/museum/翠凝珠华.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/27596c0504b4c6959251bb3d3368672b.glb",
  },
  {
    title: "翠玉灵犬",
    subtitle: "Jadeite Lucky Pups",
    desc: "以翡翠雕琢而成的萌犬，毛色纹理自然天成，红绳流苏点缀更添喜气。双犬并立，寓意“犬守安康”，既是雅致摆件，又承载守护家宅、带来好运的美好祝福。",
    img: "/museum/翠玉灵犬.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/606118c72387058cb44486dacfccbd93.glb",
  },
  {
    title: "翠钻流光戒",
    subtitle: "Diamond Radiance Ring",
    desc: "戒指以饱满蛋面翡翠为主石，翠色浓郁通透，周围群镶钻石如星芒环绕，钻石的璀璨与翡翠的温润相得益彰。精湛的镶嵌工艺让两种宝石完美融合，光影流转间尽显奢华雅致，既是彰显品味的时尚单品，也承载着富贵吉祥的美好寓意。",
    img: "/museum/翠钻流光戒.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/a616abfe3213b9bf92170e450b8b33a8.glb",
  },
  {
    title: "沉香翠缘手链",
    subtitle: "Agarwood Jade Encounter Bracelet",
    desc: "精选沉香木圆珠与翡翠椭圆珠错落串联，沉香木质朴沉稳，翡翠莹润清透，二者刚柔并济，碰撞出独特的东方韵味。佩戴间，沉香淡雅香气若隐若现，翡翠灵动翠色点缀腕间，既是修身养性的雅物，也是承载美好寓意的幸运配饰。",
    img: "/museum/沉香翠缘手链.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/b0e98986fb5d1acb1b2ead5c74786048 (1).glb",
  },
  {
    title: "紫翠凝香项链",
    subtitle: "Jadeite Elegance Necklace",
    desc: "以柔美紫玉石珠串为基底，缀以多颗饱满翡翠蛋面，辅以群镶钻饰点缀。紫玉的淡雅与翡翠的鲜翠交相辉映，Y字型设计垂坠间尽显灵动，既融合了东方玉石的温润底蕴，又兼具西式珠宝的华丽工艺，是彰显贵气与品味的点睛之笔。",
    img: "/museum/紫翠凝香项链.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/c95b54237a5ad53492e3588b7ce4d5f6.glb",
  },
  {
    title: "蝴蝶胸针",
    subtitle: "Butterfly brooch",
    desc: "以蝴蝶为形，翡翠雕琢翅脉，钻石铺陈光华，金银交织勾勒优雅轮廓。轻别于襟前，似有蝴蝶翩然停驻，翡翠的温润与钻石的璀璨相映成趣。寓意“福蝶临门”的吉祥祝愿，更添一份灵动优雅气质，传统工艺与现代审美的诗意碰撞。",
    img: "/museum/蝴蝶胸针.jpg",
    imgPos: "center 50%",
    modelUrl: "/model_3d/蝴蝶胸针.glb",
  },
];


const MuseumPage = ({ onBack }: { onBack: () => void }) => {
  const [active, setActive] = useState(0);
  const artifact = museumArtifacts[active];

  return (
<div className="min-h-screen bg-[#050805] text-white relative pt-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.05),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(212,175,55,0.08),transparent_30%),linear-gradient(135deg,rgba(8,24,18,0.95),rgba(5,8,5,0.95))]" />
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-16 relative z-10">
        {/* 头部 - 移动端垂直排列，文字居中 */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 md:mb-8 text-center md:text-left gap-4">
          <div>
            <p className="text-[10px] md:text-xs tracking-[0.35em] uppercase text-[#d4af37] mb-1 md:mb-2">
              AI Jade Museum
            </p>
            <h1 className="text-2xl md:text-5xl font-bold serif">
              名玉 · AI 博物馆
            </h1>
            <p className="text-gray-300 text-xs md:text-base mt-1 md:mt-2">
              多模型轮播、拖拽平移、缩放、竖轴自转，近距离看质感。
            </p>
          </div>
          <button
            onClick={onBack}
            className="px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/20 text-xs md:text-sm hover:border-[#d4af37] hover:text-[#d4af37] transition"
          >
            返回首页
          </button>
        </div>

        {/* 主内容区：移动端列向排列 */}
        <div className="flex flex-col lg:grid lg:grid-cols-[1.2fr_0.9fr] gap-6 md:gap-8">
          {/* 3D 画布区域 */}
          <div className="order-2 lg:order-none rounded-2xl md:rounded-3xl border border-white/10 bg-black/30 backdrop-blur shadow-2xl h-[280px] sm:h-[380px] md:h-[520px] lg:h-[620px] overflow-hidden">
            <JadeMuseumCanvas
              key={artifact.modelUrl}
              imageUrl={artifact.img}
              modelUrl={artifact.modelUrl}
            />
          </div>

          {/* 右侧信息及缩略图 */}
          <div className="order-1 lg:order-none space-y-4 md:space-y-6">
            {/* 当前文物详情卡片 */}
            <div className="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.3em] md:tracking-[0.35em] text-[#d4af37] mb-2">
                {artifact.subtitle}
              </p>
              <h2 className="text-xl md:text-3xl font-bold serif mb-2">{artifact.title}</h2>
              <p className="text-sm md:text-base text-gray-200/90 leading-relaxed">
                {artifact.desc}
              </p>
              <div className="mt-3 md:mt-4 flex items-center gap-2 text-[10px] md:text-xs text-gray-400">
                <Sparkles size={12} className="text-[#d4af37] md:w-3.5 md:h-3.5" />
                <span>拖拽平移 · 滚轮缩放 · 竖轴慢速旋转</span>
              </div>
            </div>

            {/* 缩略图网格：移动端改为横向滚动，桌面端网格 */}
            <div className="relative">
              <div className="flex flex-nowrap lg:grid lg:grid-cols-3 gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-600">
                {museumArtifacts.map((item, idx) => (
                  <button
                    key={item.modelUrl}
                    onClick={() => setActive(idx)}
                    className={`flex-shrink-0 w-28 sm:w-32 md:w-auto lg:flex-shrink group rounded-xl md:rounded-2xl border overflow-hidden transition-all flex flex-col justify-start items-stretch ${
                      idx === active
                        ? "border-[#d4af37] shadow-lg shadow-[#d4af37]/30"
                        : "border-white/10 hover:border-[#d4af37]/60"
                    }`}
                  >
                    <div className="h-20 sm:h-24 bg-black/40 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.title}
                        style={{ objectPosition: item.imgPos ?? "center 50%" }}
                        className="w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.04] group-hover:opacity-100 opacity-90"
                      />
                    </div>
                    <div className="p-2 md:p-3 text-left">
                      <p className="text-xs md:text-sm font-semibold text-white truncate">{item.title}</p>
                      <p className="text-[9px] md:text-[11px] text-gray-400 uppercase tracking-wide truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
              {/* 移动端右侧渐变提示 */}
              <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[#050805] to-transparent pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuseumPage;