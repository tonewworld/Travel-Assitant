import { useRef, useState } from "react";
import { Layout, Row, Col, Card, Form, Input, InputNumber, DatePicker, Button, message } from "antd";
import dayjs from "dayjs";
import { ChatPanel } from "./components/ChatPanel";
import { PreferencePanel } from "./components/PreferencePanel";
import { ItineraryView } from "./components/ItineraryView";
import { ExportPanel } from "./components/ExportPanel";
import { Itinerary, UserPreference } from "./types";
import { generateItinerary } from "./api/api";
import "./styles/global.css";

const { Header, Content } = Layout;

function App() {
  const [preference, setPreference] = useState<UserPreference>({});
  const [loading, setLoading] = useState(false);
  const [itinerary, setItinerary] = useState<Itinerary | undefined>(undefined);
  const [lastRequirement, setLastRequirement] = useState<string | undefined>();
  const printRef = useRef<HTMLDivElement>(null);

  const [form] = Form.useForm();

  const handleGenerate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      const resp = await generateItinerary({
        destination: values.destination,
        days: values.days,
        startDate: values.startDate
          ? values.startDate.format("YYYY-MM-DD")
          : undefined,
        departureCity: values.departureCity,
        theme: values.theme,
        userPreference: preference,
        rawRequirement: lastRequirement
      });
      setItinerary(resp);
    } catch (e: any) {
      if (e?.errorFields) {
        message.error("请先完善必要的行程信息");
      } else {
        console.error(e);
        message.error("生成攻略失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0" }}>
        <div className="app-layout">
          <h2 style={{ margin: 0 }}>旅游规划助手</h2>
        </div>
      </Header>
      <Content>
        <div className="app-layout" style={{ marginTop: 12 }}>
          <Row gutter={[12, 12]}>
            <Col xs={24} md={12}>
              <Card size="small" style={{ marginBottom: 12 }} title="行程基础信息">
                <Form
                  layout="vertical"
                  form={form}
                  initialValues={{
                    days: 3
                  }}
                >
                  <Form.Item
                    label="目的地城市"
                    name="destination"
                    rules={[{ required: true, message: "请输入目的地" }]}
                  >
                    <Input placeholder="例如：成都 / 北京 / 杭州" />
                  </Form.Item>
                  <Form.Item
                    label="行程天数"
                    name="days"
                    rules={[{ required: true, message: "请输入行程天数" }]}
                  >
                    <InputNumber min={1} max={30} style={{ width: "100%" }} />
                  </Form.Item>
                  <Form.Item label="出发日期" name="startDate">
                    <DatePicker
                      style={{ width: "100%" }}
                      disabledDate={(d) => d && d < dayjs().startOf("day")}
                    />
                  </Form.Item>
                  <Form.Item label="出发城市" name="departureCity">
                    <Input placeholder="可选，例如：上海 / 广州" />
                  </Form.Item>
                  <Form.Item label="旅行主题" name="theme">
                    <Input placeholder="可选，例如：美食、亲子、人文历史等" />
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="primary"
                      onClick={handleGenerate}
                      loading={loading}
                      block
                    >
                      生成旅游攻略
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              <PreferencePanel
                value={preference}
                onChange={setPreference}
              />

              <ChatPanel
                onUserMessage={(msg) => {
                  setLastRequirement(msg);
                }}
              />
            </Col>

            <Col xs={24} md={12}>
              <ItineraryView itinerary={itinerary} printRef={printRef} />
              <div style={{ marginTop: 12 }}>
                <ExportPanel itinerary={itinerary} printRef={printRef} />
              </div>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  );
}

export default App;