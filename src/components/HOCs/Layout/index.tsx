import { LayoutProps } from '../../../utils/types'
import Spinner from '../../Spinner'
import styles from './Layout.module.scss'

function Layout({ isLoading, children }: LayoutProps) {
  return (
    <>
      {isLoading && (
        <div className={styles.spinner_container}>
          <Spinner />
        </div>
      )}
      {children}
    </>
  )
}

export default Layout
