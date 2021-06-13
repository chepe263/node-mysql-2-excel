require('dotenv').config()

const { Sequelize } = require('sequelize');
const XLSX = require('xlsx');
const db_name = process.env.DB_DATABASE;
const db_user = process.env.DB_USER;
const db_pass = process.env.DB_PASS;
const db_host = process.env.DB_HOST;
const file_extension = process.env.FILE_EXTENSION;
const { QueryTypes } = require('sequelize');
// const cliProgress = require('cli-progress');
const _ = require("lodash");

const path = require("path");
const fs = require("fs");

const out_path = path.resolve(__dirname, "out");

const sequelize = new Sequelize(db_name, db_user, db_pass, {
    host: db_host,
    dialect: 'mysql', /* one of  | 'mariadb' | 'postgres' | 'mssql' */
    logging: false
  });
  
if (!fs.existsSync(out_path)){
    fs.mkdirSync(out_path);
}
// const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
/**
 * Creates a workbook and adds mysql tables as worksheets
 * @returns SheetJS Workbook
 */
async function dump() {
    const tables = await sequelize.query(`SELECT TABLE_NAME as "name" FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = "${db_name}"`, { type: QueryTypes.SELECT });
    // bar1.start(tables.length, 0);
    var wb = XLSX.utils.book_new();
    var select_limit = "";
    // select_limit = "LIMIT 0, 1000";
    await Promise.all(tables.map(async (table_name, index) => {
        var ws_name = table_name.name;
        var progress_percent = ((index + 1) * 100) / tables.length;
        // bar1.update((index + 1));
        console.log(`Dump table "${ws_name}" ~${Math.floor(progress_percent)}%.`)
        var table_data = await sequelize.query(`SELECT * FROM \`${table_name.name}\` ${select_limit}`.trim(), { type: QueryTypes.SELECT })

        // Add data to worksheet
        var ws = XLSX.utils.json_to_sheet(table_data);
        
        /* Add the worksheet to the workbook */
        XLSX.utils.book_append_sheet(wb, ws, ws_name);
        return null;
    }));
    // bar1.stop();
    return wb;
}

/**
 * Calls `dump()` to create a new workbook and writes the result as `out/[database-name].[file-extension]`
 * @returns undefined
 */
async function run(){
    var start_time = (new Date()).getTime();
    console.log("Write XLSX...");
    XLSX.writeFile(await dump(), path.resolve(out_path, `${db_name}-dump.${file_extension}`));
    var end_time = (new Date()).getTime();
    console.log(Math.floor((end_time - start_time) / 1000), " segs.");
    console.log("Exit...");
    return process.exit(0);
}

/**
 * Go go sheetjs, sequelize!
 */
run();
