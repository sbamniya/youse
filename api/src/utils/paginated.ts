export const paginatedResponse = <T>({
  data,
  total: _total,
  page: _page,
  limit: _limit,
}: {
  data: T[];
  total: number;
  page: number;
  limit: number;
}) => {
  const total = Number(_total);
  const page = Number(_page);
  const limit = Number(_limit);
  const totalPages = Math.ceil(total / limit);
  return {
    data,
    pagination: {
      totalItems: total,
      currentPage: page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      previousPage: page > 1 ? page - 1 : null,
      firstPage: 1,
      lastPage: totalPages,
      isFirstPage: page === 1,
      isLastPage: page === totalPages,
      isEmpty: data.length === 0,
    },
  };
};
