import { useEffect, useState, useCallback } from 'react';
import { DataTableQueryProps, CustomColumn } from './types';
import { sendPost } from '../../services/serviceRequest';
import { ResultQuery } from '../../interface/resultQuery';
import { toTitleCase } from '../../../utils/stringUtil';
import { Column } from '../../interface/column';
import { Query } from '../../interface/query';

export type UseDataTableQueryProps = {
    query: Query;
    customColumns?: Array<CustomColumn>;
    selectionMode?: 'single' | 'multiple';
};

export default function useDataTableQuery(props: UseDataTableQueryProps): DataTableQueryProps {

    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(false);
    const [columnVisibility, setColumnVisibility] = useState({})
    const [selectionMode, setSelectionMode] = useState<string>(props.selectionMode || 'single');
    const [selected, setSelected] = useState<any | any[]>();
    const [index, setIndex] = useState<number>(-1);


    const { query, customColumns } = props;

    useEffect(() => {
        // Create an scoped async function in the hook
        async function init() {
            await callService();
        } // Execute the created function directly
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);



    const onRefresh = async () => {
        await callService();
    };

    //  const onUpdate2 = useCallback(async () => {
    //      console.log('2222');
    //      await callService();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
    //  }, []);


    const callService = async () => {
        setLoading(true);
        try {
            const result = await sendPost(query.serviceName, query.params);
            const req: ResultQuery = result.data;
            setData(req.rows);
            readCustomColumns(req.columns);
            setColumns(req.columns);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }


    const readCustomColumns = (_columns: Column[]) => {
        if (customColumns) {
            customColumns?.forEach(async (_column) => {
                const currentColumn = _columns.find((_col) => _col.name === _column.name.toLowerCase());
                if (currentColumn) {
                    currentColumn.visible = 'visible' in _column ? _column.visible : currentColumn.visible;
                    currentColumn.filter = 'filter' in _column ? _column.filter : currentColumn.filter;
                    currentColumn.label = 'label' in _column ? toTitleCase(_column?.label) : currentColumn.label;
                    currentColumn.header = 'label' in _column ? toTitleCase(_column?.label) : currentColumn.label;
                    currentColumn.order = 'order' in _column ? _column.order : currentColumn.order;
                    currentColumn.decimals = 'decimals' in _column ? _column.decimals : currentColumn.decimals;
                    currentColumn.comment = 'comment' in _column ? _column.comment : currentColumn.comment;
                    currentColumn.upperCase = 'upperCase' in _column ? _column.upperCase : currentColumn.upperCase;
                    currentColumn.align = 'align' in _column ? _column.align : currentColumn.align;
                    currentColumn.size = 'size' in _column ? _column.size : currentColumn.size;
                }
                else {
                    throw new Error(`Error la columna ${_column.name} no existe`);
                }
            });
            // columnas visibles false
            const hiddenCols: any = {};
            _columns.filter((_col) => _col.visible === false).forEach(_element => {
                hiddenCols[_element.name] = false
            });
            setColumnVisibility(hiddenCols);
            // ordena las columnas
            _columns.sort((a, b) => (Number(a.order) < Number(b.order) ? -1 : 1));
        }
    }

    return {
        data,
        columns,
        loading,
        columnVisibility,
        onRefresh
    }
}
