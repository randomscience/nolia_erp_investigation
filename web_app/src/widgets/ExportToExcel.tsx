
// import * as XLSX from "xlsx";
import * as XLSX from 'xlsx-js-style';
import { MainButton } from './MainButton';
import { FaDownload } from "react-icons/fa";
import { formatDate } from "../helpers/PBFunctions";
import { pb } from "../constants";


export default function DownloadExcel({ data, fileName }: { data: any[], fileName: string }) {

    const handleDownload = () => {

        const worksheet = XLSX.utils.aoa_to_sheet([
 
            [{
                v: `INTERNAL`,
                s: {
                    font: {
                        bold: true,
                        color: { rgb: "FF0000" },
                        sz: 18
                    }
                }
            }, {
                v: `DO NOT DISTRIBUTE`,
                s: {
                    font: {
                        bold: true,
                        color: { rgb: "FF0000" },
                        sz: 18
                    }
                }
            }
                ,
                "Eksport z dnia:",
            `${formatDate(Date.now())}`,
                "Wygenerowano przez:",
            `${pb.authStore.model?.email}`
            ],

        ]);

        XLSX.utils.sheet_add_json(
            worksheet,
            data, { origin: 1 }
        );

        const headers = Object.keys(data[0] ?? {});
        headers.forEach((_, columnIndex) => {
            const headerCell = XLSX.utils.encode_cell({ r: 1, c: columnIndex });
            if (worksheet[headerCell]) {
                worksheet[headerCell].s = {
                    font: { bold: true, color: { rgb: "FFFFFF" } },
                    fill: { fgColor: { rgb: "315B50" } },
                    alignment: { vertical: "center" },
                };
            }

            for (let rowIndex = 2; rowIndex < data.length + 2; rowIndex++) {
                const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
                if (worksheet[cellAddress] && rowIndex % 2 === 1) {
                    worksheet[cellAddress].s = {
                        fill: { fgColor: { rgb: "EAF2EF" } },
                    };
                }
            }
        });

        if (headers.length > 0) {
            const lastColumn = XLSX.utils.encode_col(headers.length - 1);
            worksheet["!autofilter"] = { ref: `A2:${lastColumn}${data.length + 2}` };
        }

        worksheet["!cols"] = headers.map((key) => {
            const maxLength = data.reduce(
                (max, row) => Math.max(max, String(row[key] ?? "").length),
                key.length,
            );
            return { wch: maxLength + 6 };
        });

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

        XLSX.writeFile(workbook, `Nolia_db_INTERNAL_EXPORT_${fileName}_${formatDate(Date.now())}.xlsx`);
    };

    return (
        <MainButton onClick={handleDownload} label={"Pobierz"} leftIcon={<FaDownload />} />
    );
}