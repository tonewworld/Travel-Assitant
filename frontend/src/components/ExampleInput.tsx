import { Button, Space, Typography } from "antd";

const { Text } = Typography;

interface Props {
  onSelect: (text: string) => void;
}

const examples = [
  "五一假期想去成都玩 3 天，主要想吃好吃的，拍照打卡，帮我生成详细行程。",
  "端午节从上海出发去杭州，两天一夜，偏向安静一点的行程，有没有推荐？",
  "想带父母去北京玩 4 天，节奏不要太累，帮我规划下每天怎么走。",
];

export function ExampleInput({ onSelect }: Props) {
  return (
    <div style={{ marginBottom: 8 }}>
      <Text type="secondary" style={{ marginRight: 8 }}>示例输入：</Text>
      <Space wrap>
        {examples.map((e) => (
          <Button
            key={e}
            size="small"
            onClick={() => onSelect(e)}
          >
            {e}
          </Button>
        ))}
      </Space>
    </div>
  );
}