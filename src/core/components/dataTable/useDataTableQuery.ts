import { ColumnFilter } from '@tanstack/react-table';
import { useState, useEffect, useCallback } from 'react';

import { UseDataTableQueryReturnProps } from './types';
import { sendPost } from '../../services/serviceRequest';
import { Query, Column, TableQuery, ResultQuery, CustomColumn } from '../../types';

export type UseDataTableQueryProps = {
    config: Query | TableQuery;
    ref: any;
};

export default function useDataTableQuery(props: UseDataTableQueryProps): UseDataTableQueryReturnProps {

    const [primaryKey, setPrimaryKey] = useState<string>("id");
    const [data, setData] = useState<any[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>('single');
    const [columnVisibility, setColumnVisibility] = useState({})
    const [selected, setSelected] = useState<any>(); // selectionMode single fila seleccionada o editada
    const [index, setIndex] = useState<number>(-1);
    const [initialize, setInitialize] = useState(false);

    const [rowSelection, setRowSelection] = useState({})  // selectionMode multiple /single
    // const getSelectedRows = () => props.ref.current.table.getSelectedRowModel().flatRows.map((row: { original: any; }) => row.original) || [];


    useEffect(() => {
        // Create an scoped async function in the hook
        async function init() {
            await callService();
        } // Execute the created function directly
        init();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    /**
    * Maneja la seleccion de la fila
    */
    useEffect(() => {
        if (index >= 0) {
            try {
                setSelected(data[index]);
                onSelectRow(props.ref.current.table.getRowModel().rows[index].id)
            } catch (e) {
                setIndex(-1);
                throw new Error(`ERROR. index no válido ${index}`)
            }
        }
        else {
            props.ref.current.table.setRowSelection({});
            setRowSelection({});
            setSelected(undefined);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);


    /**
     * Actualiza la data
     */
    const onRefresh = async () => {
        setIndex(-1);
        await callService();
    };


    const onSelectionModeChange = (_selectionMode: 'single' | 'multiple') => {
        setSelectionMode(_selectionMode)
        setIndex(-1);
        setRowSelection({});
    };

    //  const onUpdate2 = useCallback(async () => {
    //      console.log('2222');
    //      await callService();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
    //  }, []);

    const onSelectRow = useCallback(
        (id: string) => {
            if (selectionMode === 'single') {
                setRowSelection({ [id]: true });
            }
        },
        [selectionMode]
    );



    const setColumnFilters = (filters: ColumnFilter[]) => {
        props.ref.current.table.setColumnFilters(filters);
    }

    const callService = async () => {
        setLoading(true);
        try {
            let service = 'api/core/getResultQuery'
            let param = {};
            if ('serviceName' in props.config) { // Query
                service = props.config.serviceName;
                param = props.config.params;
            }
            else {
                param = props.config;
            }
            const result = await sendPost(service, param);
            const req: ResultQuery = result.data;

            if (initialize === false) {
                setInitialize(true);
                readCustomColumns(req.columns);
                setColumns(req.columns);
                setPrimaryKey(req.primaryKey);
            }
            setData(req.rows);
        } catch (error) {
            console.error(error);
        }
        setLoading(false);
    }


    const readCustomColumns = (_columns: Column[]) => {
        const { customColumns } = props.ref.current;
        if (customColumns) {
            customColumns?.forEach(async (_column: CustomColumn) => {
                const currentColumn = _columns.find((_col) => _col.name === _column.name.toLowerCase());
                if (currentColumn) {
                    currentColumn.visible = 'visible' in _column ? _column.visible : currentColumn.visible;
                    currentColumn.enableColumnFilter = 'filter' in _column ? _column.filter : currentColumn.enableColumnFilter;
                    currentColumn.enableSorting = 'orderable' in _column ? _column.orderable : currentColumn.enableSorting;
                    currentColumn.label = 'label' in _column ? _column?.label : currentColumn.label;
                    currentColumn.header = 'label' in _column ? _column?.label : currentColumn.label;
                    currentColumn.order = 'order' in _column ? _column.order : currentColumn.order;
                    currentColumn.decimals = 'decimals' in _column ? _column.decimals : currentColumn.decimals;
                    currentColumn.comment = 'comment' in _column ? _column.comment : currentColumn.comment;
                    currentColumn.upperCase = 'upperCase' in _column ? _column.upperCase : currentColumn.upperCase;
                    currentColumn.align = 'align' in _column ? _column.align : currentColumn.align;

                    if ('component' in _column) {
                        if (_column.component === 'Image') {
                            currentColumn.component = 'Image';
                            currentColumn.align = 'center';
                            currentColumn.size = 60;
                            currentColumn.enableColumnFilter = false;
                        }
                    }
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
        index,
        setIndex,
        initialize,
        rowSelection,
        setRowSelection,
        setColumnVisibility,
        setColumnFilters,
        columns,
        primaryKey,
        loading,
        columnVisibility,
        selected,
        selectionMode,
        onRefresh,
        onSelectRow,
        onSelectionModeChange
    }
}
