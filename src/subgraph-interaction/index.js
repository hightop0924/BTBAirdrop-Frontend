import { ApolloClient, InMemoryCache, gql } from "@apollo/client";

const client = new ApolloClient({
  uri: process.env.REACT_APP_SUBGRAPH_QUERYS_URL,
  cache: new InMemoryCache()
});

export async function readListOfStakeEvents(fromTimestamp, toTimestamp) {
  try {
    const stakingList = await client.query({
      query: gql`
          {
            stakes(where: { _time_gte: ${fromTimestamp}, _time_lte: ${toTimestamp} }) {
              _addr
              _amount
              _poolIndex
              _time
            }
           
          }
        `
    });
    console.log("stakingList  >>> ", stakingList);
    return stakingList?.data || [];
  } catch (error) {

    return [];
  }

}

// unstakes(where: { _time_gte: ${fromTimestamp}, _time_lte: ${toTimestamp} }) {
//     _addr
//     _amount
//     _poolIndex
//     _time
//   }