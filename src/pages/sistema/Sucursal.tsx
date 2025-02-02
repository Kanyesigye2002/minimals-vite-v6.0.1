import { useRef, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';

import { LoadingButton } from '@mui/lab';
import { Card, Container } from '@mui/material';

import { paths } from 'src/routes/paths';

import { usePage } from 'src/core/hooks/usePage';
import { getNombreEmpresa } from 'src/api/sistema';
import { DataTable, useDataTable } from 'src/core/components/dataTable';
import { listDataEmpresa, useTableQuerySucursales } from 'src/api/empresa';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';


// ----------------------------------------------------------------------

export default function Sucursal() {

  const { saveAll, loadingSave } = usePage();

  const refDataTable = useRef();
  const dataTable = useDataTable({ config: useTableQuerySucursales(), ref: refDataTable });


  const customColumns = useMemo(() => [
    {
      name: 'ide_sucu', visible: true, disabled: true
    },
    {
      name: 'nom_sucu', label: 'Nombre', required: true, unique: true
    },
    {
      name: 'ide_empr', dropDown: listDataEmpresa, visible: true
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);


  const onChangeEmpresa = (): void => {
    console.log(dataTable.index);
    console.log(dataTable.columns);
    dataTable.setValue(dataTable.index, 'Telefonos_sucu', 'xxxxx2');
    console.log(dataTable.getValue(dataTable.index, 'Telefonos_sucu'));
  };

  const onSave = async () => {
    if (await dataTable.isValidSave())
      await saveAll(dataTable);
  };


  return (
    <>
      <Helmet>
        <title>Sucursales</title>
      </Helmet>
      <Container>
        <CustomBreadcrumbs
          heading="Sucursales"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: getNombreEmpresa() },
          ]}
          action={
            <LoadingButton
              onClick={onSave}
              disabled={!dataTable.isPendingChanges()}
              loading={loadingSave}
              color="success"
              variant="contained"
              startIcon={<Iconify icon="ic:round-save-as" />}
            >
              Guardar
            </LoadingButton>
          }
        />
      </Container>
      <Card>

        <DataTable
          ref={refDataTable}
          useDataTable={dataTable}
          editable
          rows={50}
          showRowIndex
          numSkeletonCols={11}
          customColumns={customColumns}
          eventsColumns={[
            {
              name: 'ide_empr', onChange: onChangeEmpresa
            },
          ]}
        />
      </Card>
    </>
  );
}
