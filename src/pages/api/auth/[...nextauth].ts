import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { fauna } from "../../../services/fauna"
import { query as q } from 'faunadb'

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      authorization: { params: { scope: 'read:user' } },
    }),
  ],
  callbacks: {
    async session(session: any) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(q.Intersection([
            q.Match(q.Index('subscription_by_user_ref'), q.Select("ref", q.Get(q.Match(q.Index('user_by_email'), q.Casefold(session.user.email))))),
            q.Match(q.Index('subscription_by_status'), "active")
          ]))
        )
        return {
          ...session,
          userActiveSubscription: userActiveSubscription
        }
      }
      catch {
        return {
          ...session,
          userActiveSubscription: null
        }
      }

    },
    async signIn({ user }: { user: any }) {
      const { email } = user

      try {

        await fauna.query(
          q.If(q.Not(q.Exists(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))),
            q.Create(
              q.Collection('users'),
              { data: { email } }
            ),

            q.Get(q.Match(q.Index('user_by_email'), q.Casefold(user.email)))

          )
        )
        return true

      } catch {
        return false
      }

    },
  }
}
export default NextAuth(authOptions)