import { useRef, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';

import { useBoolean } from 'src/hooks/use-boolean';

import { createFolder } from 'src/api/files/files';

import Iconify from 'src/components/iconify';
import { TableProps } from 'src/components/table';

import { IFile } from 'src/types/file';

import FileManagerPanel from './file-manager-panel';
import FileManagerFileItem from './file-manager-file-item';
import FileManagerFolderItem from './file-manager-folder-item';
import FileManagerShareDialog from './file-manager-share-dialog';
import FileManagerActionSelected from './file-manager-action-selected';
import FileManagerNewFolderDialog from './file-manager-new-folder-dialog';

// ----------------------------------------------------------------------

type Props = {
  table: TableProps;
  dataFiltered: IFile[];
  onOpenConfirm: VoidFunction;
  mutate: VoidFunction;
  selectFolder?: IFile;
  currentProducto?:any;
  onDeleteItem: (id: string) => void;
  onChangeFolder: (row: IFile) => void;
};

export default function FileManagerGridView({
  table,
  dataFiltered,
  onDeleteItem,
  onOpenConfirm,
  onChangeFolder,
  mutate,
  selectFolder,
  currentProducto,
}: Props) {
  const { selected, onSelectRow: onSelectItem, onSelectAllRows: onSelectAllItems } = table;

  const containerRef = useRef(null);

  const [folderName, setFolderName] = useState('');

  const [inviteEmail, setInviteEmail] = useState('');

  const share = useBoolean();

  const newFolder = useBoolean();

  const upload = useBoolean();

  const files = useBoolean();

  const folders = useBoolean();

  const handleChangeInvite = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setInviteEmail(event.target.value);
  }, []);

  const handleChangeFolderName = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  }, []);



  return (
    <>
      <Box ref={containerRef}>
        <FileManagerPanel
          title="Carpetas"
          subTitle={`${dataFiltered.filter((item) => item.type === 'folder').length} carpetas`}
          onOpen={newFolder.onTrue}
          collapse={folders.value}
          onCollapse={folders.onToggle}
        />

        <Collapse in={!folders.value} unmountOnExit>
          <Box
            gap={3}
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
          >
            {dataFiltered
              .filter((i) => i.type === 'folder')
              .map((folder) => (
                <FileManagerFolderItem
                  key={folder.id}
                  folder={folder}
                  selected={selected.includes(folder.id)}
                  onSelect={() => onSelectItem(folder.id)}
                  onDelete={() => onDeleteItem(folder.id)}
                  onChangeFolder={() => onChangeFolder(folder)}
                  mutate={mutate}
                  sx={{ maxWidth: 'auto' }}
                />
              ))}
          </Box>
        </Collapse>

        <Divider sx={{ my: 5, borderStyle: 'dashed' }} />

        <FileManagerPanel
          title="Archivos"
          subTitle={`${dataFiltered.filter((item) => item.type !== 'folder').length} archivos`}
          onOpen={upload.onTrue}
          collapse={files.value}
          onCollapse={files.onToggle}
        />

        <Collapse in={!files.value} unmountOnExit>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            }}
            gap={3}
          >
            {dataFiltered
              .filter((i) => i.type !== 'folder')
              .map((file) => (
                <FileManagerFileItem
                  key={file.id}
                  file={file}
                  selected={selected.includes(file.id)}
                  onSelect={() => onSelectItem(file.id)}
                  onDelete={() => onDeleteItem(file.id)}
                  sx={{ maxWidth: 'auto' }}
                  mutate={mutate}
                />
              ))}
          </Box>
        </Collapse>

        {!!selected?.length && (
          <FileManagerActionSelected
            numSelected={selected.length}
            rowCount={dataFiltered.length}
            selected={selected}
            onSelectAllItems={(checked) =>
              onSelectAllItems(
                checked,
                dataFiltered.map((row) => row.id)
              )
            }
            action={
              <>
                <Button
                  size="small"
                  color="error"
                  variant="contained"
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  onClick={onOpenConfirm}
                  sx={{ mr: 1 }}
                >
                  Eliminar
                </Button>

                <Button
                  color="primary"
                  size="small"
                  variant="contained"
                  startIcon={<Iconify icon="solar:share-bold" />}
                  onClick={share.onTrue}
                >
                  Compartir
                </Button>
              </>
            }
          />
        )}
      </Box>

      <FileManagerShareDialog
        open={share.value}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onClose={() => {
          share.onFalse();
          setInviteEmail('');
        }}
      />

      <FileManagerNewFolderDialog open={upload.value} onClose={upload.onFalse} mutate={mutate} />

      <FileManagerNewFolderDialog
        open={newFolder.value}
        onClose={newFolder.onFalse}
        title="Nueva Carpeta"
        mutate={mutate}
        onCreate={async () => {
          await createFolder({ folderName, sis_ide_arch: selectFolder?.ide_arch, ide_inarti: currentProducto?.ide_inarti  ? Number(currentProducto?.ide_inarti): undefined })
          newFolder.onFalse();
          setFolderName('');
          mutate();
          // console.info('CREATE NEW FOLDER', folderName);
        }}
        folderName={folderName}
        onChangeFolderName={handleChangeFolderName}
      />
    </>
  );
}
