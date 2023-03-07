import React from "react";
import { ComponentMeta, ComponentStory } from "@storybook/react";
import { DepositBox } from "./DepositBox";
import { AddressName } from "../../../pages";

export default {
  component: DepositBox,
} as ComponentMeta<typeof DepositBox>;

const Template: ComponentStory<typeof DepositBox> = (args) => <DepositBox {...args} />;

export const Empty = Template.bind({});
Empty.args = { tokens: new Map() };

const twoTokens: Map<`0x${string}`, string> = new Map([
  ["0x01", "First"],
  ["0x02", "Second"],
]);
export const TwoTokens = Template.bind({});
TwoTokens.args = { tokens: twoTokens };
