import React, { useEffect, useState } from "react";
import {
  IndexTable,
  LegacyCard,
  Text,
  Avatar,
  Layout,
  Page,
} from "@shopify/polaris";

function SimpleIndexTableExample() {
  const users = [
    {
      id: "1",
      name: "John Doe",
      image: "https://via.placeholder.com/50",
      skinType: "Dry",
    },
    {
      id: "2",
      name: "Jane Smith",
      image: "https://via.placeholder.com/50",
      skinType: "Oily",
    },
    {
      id: "3",
      name: "Alex Johnson",
      image: "https://via.placeholder.com/50",
      skinType: "Combination",
    },
  ];

  const resourceName = {
    singular: "user",
    plural: "users",
  };

  const rowMarkup = users.map(({ id, name, image, skinType }, index) => (
    <IndexTable.Row id={id} key={id} position={index}>
      <IndexTable.Cell>
        <Text>{id}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text>{name}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Avatar source={image} customer size="sm" />
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text>{skinType}</Text>
      </IndexTable.Cell>
    </IndexTable.Row>
  ));

  return (
    <Page fullWidth>
      <Layout>
        <Layout.Section>
          <ui-title-bar title="Users" />
          <LegacyCard>
            <IndexTable
              resourceName={resourceName}
              itemCount={users.length}
              selectable={false}
              headings={[
                { title: "User ID" },
                { title: "User Name" },
                { title: "User Image" },
                { title: "Skin Type" },
              ]}
            >
              {rowMarkup}
            </IndexTable>
          </LegacyCard>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export default SimpleIndexTableExample;
