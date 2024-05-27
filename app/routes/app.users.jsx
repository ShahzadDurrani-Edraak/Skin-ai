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
  const [users, setUsers] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const address = "https://4027-39-62-5-62.ngrok-free.app";
      try {
        const productResponse = await fetch(address + "/api/usersSkinProfile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "ngrok-skip-browser-warning": "true",
          },
        });

        if (productResponse.ok) {
          const data = await productResponse.json();
          const usersWithBase64Images = data.map((user) => {
            if (user.image && user.image.data) {
              const base64Flag = "data:image/jpeg;base64,";
              const imageStr = arrayBufferToBase64(
                new Uint8Array(user.image.data),
              );
              return {
                ...user,
                image: base64Flag + imageStr,
              };
            }
            return user;
          });

          setUsers(usersWithBase64Images);
        } else {
          console.error("Failed to fetch data:", productResponse.status);
        }
      } catch (error) {
        console.log("error :>> ", error);
      }
    }

    fetchData();
  }, []);

  function arrayBufferToBase64(buffer) {
    let binary = "";
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // const users = [
  //   {
  //     id: "1",
  //     name: "John Doe",
  //     image: "https://via.placeholder.com/50",
  //     skinType: "Dry",
  //   },
  //   {
  //     id: "2",
  //     name: "Jane Smith",
  //     image: "https://via.placeholder.com/50",
  //     skinType: "Oily",
  //   },
  //   {
  //     id: "3",
  //     name: "Alex Johnson",
  //     image: "https://via.placeholder.com/50",
  //     skinType: "Combination",
  //   },
  // ];

  const resourceName = {
    singular: "user",
    plural: "users",
  };

  const rowMarkup = users.map(({ id, userName, image, skinType }, index) => (
    <IndexTable.Row id={id} key={id} position={index}>
      <IndexTable.Cell>
        <Text>{id}</Text>
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Text>{userName}</Text>
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
