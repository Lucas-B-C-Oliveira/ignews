import { useSession, signIn } from 'next-auth/react';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripe-js';
import styles from './styles.module.scss'
import { useRouter } from 'next/router';

interface SubscribeButtonProps {
  priceId: string;
}

export function SubscribeButton() {
  // const { data } = useSession()
  // const router = useRouter

  const { data: session } = useSession();
  const router = useRouter();


  // @ts-ignore
  // const session = data?.session && data.session



  async function handleSubscribe() {

    if (!session) {
      signIn('github')
      return
    }

    // @ts-ignore
    if (session.activeSubscription) {
      // @ts-ignore
      router?.push('/posts')
      return
    }

    // if (session) {
    //   router.push("/posts");
    //   return;
    // }

    try {
      const response = await api.post('/subscribe')
      const { sessionId } = response.data
      const stripe = await getStripeJs()

      await stripe?.redirectToCheckout({ sessionId })
    } catch (err) {
      // @ts-ignore
      alert(err?.message)
    }

  }

  return (
    <button type="button" className={styles.subscribeButton} onClick={handleSubscribe}>
      Subscribe now
    </button>
  )
}