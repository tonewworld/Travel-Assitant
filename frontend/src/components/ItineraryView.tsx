import { Card, Timeline, Typography, Divider, Empty } from "antd";
import { Itinerary } from "../types";

const { Text, Title, Paragraph } = Typography;

interface Props {
  itinerary?: Itinerary;
  printRef?: React.RefObject<HTMLDivElement>;
}

export function ItineraryView({ itinerary, printRef }: Props) {
  if (!itinerary) {
    return (
      <Card size="small" className="itinerary-container">
        <Empty description="尚未生成攻略，请在左侧输入需求并点击生成" />
      </Card>
    );
  }

  return (
    <Card size="small" className="itinerary-container">
      <div ref={printRef} className="itinerary-print-area">
        <Title level={4}>{itinerary.destination} {itinerary.days} 日游攻略</Title>
        {itinerary.startDate && (
          <Text type="secondary">出发日期：{itinerary.startDate}</Text>
        )}
        {itinerary.theme && (
          <Paragraph style={{ marginTop: 4 }}>
            <Text type="secondary">旅行主题：{itinerary.theme}</Text>
          </Paragraph>
        )}

        <Divider />

        {itinerary.daysDetail.map((day) => (
          <div key={day.day} style={{ marginBottom: 16 }}>
            <Title level={5}>
              第 {day.day} 天 {day.date ? `（${day.date}）` : ""} - {day.summary}
            </Title>
            <Timeline
              items={day.items.map((item) => ({
                children: (
                  <div>
                    <Text strong>{item.timeRange} - {item.title}</Text>
                    <Paragraph style={{ marginBottom: 4 }}>
                      {item.description}
                    </Paragraph>
                    {item.transportAdvice && (
                      <Text type="secondary">
                        交通建议：{item.transportAdvice}
                      </Text>
                    )}
                    {item.foodAdvice && (
                      <Paragraph style={{ margin: 0 }}>
                        <Text type="secondary">
                          餐饮建议：{item.foodAdvice}
                        </Text>
                      </Paragraph>
                    )}
                  </div>
                )
              }))}
            />
          </div>
        ))}

        {itinerary.generalTips?.length > 0 && (
          <>
            <Divider />
            <Title level={5}>通用出行建议</Title>
            {itinerary.generalTips.map((tip, idx) => (
              <Paragraph key={idx}>
                {idx + 1}. {tip}
              </Paragraph>
            ))}
          </>
        )}

        {itinerary.transportSummary && (
          <>
            <Divider />
            <Title level={5}>交通建议概览</Title>
            <Paragraph>{itinerary.transportSummary}</Paragraph>
          </>
        )}

        {itinerary.hotelSuggestions && itinerary.hotelSuggestions.length > 0 && (
          <>
            <Divider />
            <Title level={5}>住宿建议</Title>
            {itinerary.hotelSuggestions.map((h, idx) => (
              <Paragraph key={idx}>
                {idx + 1}. {h}
              </Paragraph>
            ))}
          </>
        )}
      </div>
    </Card>
  );
}