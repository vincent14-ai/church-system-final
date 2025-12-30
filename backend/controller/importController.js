import { importMembersFromExcel } from "../service/importService.js";

export const importMembers = async (req, res) => {
  await importMembersFromExcel(req, res);
};
