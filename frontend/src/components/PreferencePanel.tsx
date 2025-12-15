import { Card, Form, Select, Input, Tag, Space } from "antd";
import { UserPreference } from "../types";

interface Props {
  value: UserPreference;
  onChange: (value: UserPreference) => void;
}

const interestOptions = ["美食", "人文", "自然", "亲子", "购物", "夜生活"];

export function PreferencePanel({ value, onChange }: Props) {
  const triggerChange = (changed: Partial<UserPreference>) => {
    onChange({ ...value, ...changed });
  };

  return (
    <Card size="small" title="出行偏好" style={{ marginBottom: 12 }}>
      <Form layout="vertical">
        <Form.Item label="行程节奏">
          <Select
            value={value.travelStyle}
            placeholder="选择行程节奏"
            onChange={(v) => triggerChange({ travelStyle: v })}
            options={[
              { label: "轻松休闲", value: "relax" },
              { label: "紧凑多景点", value: "tight" },
              { label: "适中", value: "balanced" }
            ]}
          />
        </Form.Item>

        <Form.Item label="预算水平">
          <Select
            value={value.budgetLevel}
            placeholder="选择预算水平"
            onChange={(v) => triggerChange({ budgetLevel: v })}
            options={[
              { label: "经济", value: "low" },
              { label: "适中", value: "medium" },
              { label: "充足", value: "high" }
            ]}
          />
        </Form.Item>

        <Form.Item label="交通偏好">
          <Select
            value={value.transportPreference}
            placeholder="选择交通偏好"
            onChange={(v) => triggerChange({ transportPreference: v })}
            options={[
              { label: "以公共交通为主", value: "public" },
              { label: "以打车/网约车为主", value: "taxi" },
              { label: "自驾", value: "self-drive" }
            ]}
          />
        </Form.Item>

        <Form.Item label="兴趣偏好">
          <Select
            mode="multiple"
            placeholder="选择兴趣方向"
            value={value.interests}
            onChange={(v) => triggerChange({ interests: v })}
            options={interestOptions.map((i) => ({ label: i, value: i }))}
          />
          {value.interests && value.interests.length > 0 && (
            <Space size="small" style={{ marginTop: 4, flexWrap: "wrap" }}>
              {value.interests.map((i) => (
                <Tag color="blue" key={i}>{i}</Tag>
              ))}
            </Space>
          )}
        </Form.Item>

        <Form.Item label="饮食偏好（可选填）">
          <Input
            value={value.foodPreference}
            onChange={(e) => triggerChange({ foodPreference: e.target.value })}
            placeholder="例如：不吃辣 / 清淡 / 甜食控 / 素食等"
          />
        </Form.Item>
      </Form>
    </Card>
  );
}