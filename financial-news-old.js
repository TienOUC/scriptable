//创建小组件
const widget = new ListWidget();

//添加文本
const news = await getNewsContent();
//console.log(news[0]);

const text = widget.addText(`${news[0].rich_text}\n\n ${news[0].create_time}`);
text.textColor = Color.orange();
text.font = Font.boldRoundedSystemFont(13);
//text.font = new Font('Menlo', 13);
text.leftAlignText();

widget.setPadding(12, 12, 12, 0);

//添加渐变色背景
const gradient = new LinearGradient();
gradient.locations = [0, 0.5, 1];
gradient.colors = [
  new Color('#2c5364'),
  new Color('#203a43'),
  new Color('#0f2027'),
];
widget.backgroundGradient = gradient;

//设置组件
Script.setWidget(widget);

//获取news json
async function getNewsContent() {
  const url = 'https://zhibo.sina.com.cn/api/zhibo/feed?page=1&page_size=100&zhibo_id=152&tag_id=0&dire=f&dpc=1&type=0';
  const request = new Request(url, (timeoutInterval = 120));
  const res = await request.loadJSON();
  const listArr = res.result.data.feed.list;
  //用关键词过滤掉与财经无关的新闻
  const filterArr = ['比特币', '莱特币', '狗狗币', '疫苗', '新冠', '疫情', '蓬佩奥'];

  let filterResult = listArr.filter(item => {
    return filterArr.every(ele => {
      return !item.rich_text.includes(ele);
    });
  });

  return filterResult;
}

