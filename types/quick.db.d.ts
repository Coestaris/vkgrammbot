type ValueType = String | Number | Array<any>;
type AllowedOps = {
    Target : "target",
}

export function set     <T extends ValueType>(key: string, value: T, ops? : any[]): T;
export function push    <T extends ValueType>(key: string, value: T, ops?: any[]): T;
export function add     <T extends ValueType>(key: string, value: T, ops?: any[]): T;
export function subtract<T extends ValueType>(key: string, value: T, ops?: any[]): T;

export function fetch   (key: string, ops?: any[]): ValueType;
export function get     (key: string, ops?: any[]): ValueType;

export function all     (ops?: any[]): ValueType[];
export function fetchAll(ops?: any[]): any;

export function has     (key: string, ops?: any[]): boolean;
export function includes(key: string, ops?: any[]): boolean;

export class table {
    public constructor(tableName: string);
    
    public tableName : string;
    
    public set     <T extends ValueType>(key: string, value: T, ops? : any[]): T;
    public push    <T extends ValueType>(key: string, value: T, ops?: any[]): T;
    public add     <T extends ValueType>(key: string, value: T, ops?: any[]): T;
    public subtract<T extends ValueType>(key: string, value: T, ops?: any[]): T;

    public fetch   (key: string, ops?: any[]): ValueType;
    public get     (key: string, ops?: any[]): ValueType;

    public all     (ops?: any[]): ValueType[];
    public fetchAll(ops?: any[]): any;

    public has     (key: string, ops?: any[]): boolean;
    public includes(key: string, ops?: any[]): boolean;

}