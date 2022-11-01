import React, { useState } from 'react';
import {
  Button, Card, CardActions, CardHeader, Modal,
} from '@mui/material';
import { GiTwoCoins } from 'react-icons/gi';
import PaymentCard from './PaymentCard';

interface UrBuxProps {
  open: boolean
  setOpen: (urbuxModalOpen: boolean) => void
}

function UrBuxModal({ open, setOpen }: UrBuxProps): React.ReactElement {
  const [intent, setIntent] = useState(false);
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        setIntent(false);
      }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {intent
        ? (
          <Card sx={{ padding: 2 }}>
            <CardHeader title="Checkout" titleTypographyProps={{ color: 'secondary' }} subheader="Buying 1000 UrBux for $10 USD" sx={{ padding: 0, marginBottom: 1 }} />
            <PaymentCard />
          </Card>
        )
        : (
          <Card sx={{ maxWidth: '300px' }}>
            <CardHeader
              title="Buy UrBux"
              titleTypographyProps={{ color: 'secondary' }}
              subheader="Buy in-game items and support your favorite creators"
              sx={{ paddingBottom: 0.5 }}
            />
            <CardActions>
              <Button startIcon={<GiTwoCoins />} onClick={() => setIntent(true)}>
                1000 UrBux for $10
              </Button>
            </CardActions>
          </Card>
        )}
    </Modal>
  );
}

export default UrBuxModal;
