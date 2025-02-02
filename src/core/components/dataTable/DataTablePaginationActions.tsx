import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'

import { Iconify } from 'src/components/iconify'


const DataTablePaginationActions = (props: any) => {
  const theme = useTheme()
  const { count, page, rowsPerPage, onPageChange } = props

  const handleFirstPageButtonClick = (event: any) => {
    onPageChange(event, 0)
  }

  const handleBackButtonClick = (event: any) => {
    onPageChange(event, page - 1)
  }

  const handleNextButtonClick = (event: any) => {
    onPageChange(event, page + 1)
  }

  const handleLastPageButtonClick = (event: any) => {
    onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1))
  }

  return (
    <Box sx={{ flexShrink: 0, ml: 2.5 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        {theme.direction === 'rtl' ? <Iconify icon="eva:more-vertical-fill LastPageIcon" /> : <Iconify icon="eva:more-vertical-fill FirstPageIcon" />}
      </IconButton>
      <IconButton
        onClick={handleBackButtonClick}
        disabled={page === 0}
        aria-label="previous page"
      >
        {theme.direction === 'rtl' ? (
          <Iconify icon="eva:more-vertical-fill KeyboardArrowRight" />
        ) : (
          <Iconify icon="eva:more-vertical-fill KeyboardArrowLeft" />
        )}
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        {theme.direction === 'rtl' ? (
          <Iconify icon="eva:more-vertical-fill KeyboardArrowLeft" />
        ) : (
          <Iconify icon="eva:more-vertical-fill KeyboardArrowRight" />
        )}
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        {theme.direction === 'rtl' ? <Iconify icon="eva:more-vertical-fill FirstPageIcon" /> : <Iconify icon="eva:more-vertical-fill LastPageIcon" />}
      </IconButton>
    </Box>
  )
}

export default DataTablePaginationActions
